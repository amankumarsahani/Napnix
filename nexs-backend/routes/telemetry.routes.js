const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const axios = require('axios');
const { query } = require('../config/database');
const { decryptPayload } = require('../utils/telemetry-crypto');
const { UAParser } = require('ua-parser-js');
const jwt = require('jsonwebtoken');

const TELEMETRY_SECRET = process.env.PUBLIC_CRYPTO_SECRET || process.env.VITE_PUBLIC_CRYPTO_SECRET || '';

// ── Visitor IP extraction ──────────────────────────────────────────────────
// With `app.set('trust proxy', 1)`, req.ip gives the first X-Forwarded-For value.
// Behind Cloudflare, the real visitor IP is in cf-connecting-ip.
function getVisitorIp(req) {
    return (
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress ||
        null
    );
}

// ── Geo-IP cache ───────────────────────────────────────────────────────────
// Simple in-process Map: key=ip, value={ data, expiresAt }
// Cache entries live for 24 hours — geo rarely changes for the same IP.
const _geoCache = new Map();
const GEO_TTL = 24 * 60 * 60 * 1000; // 24 h

const PRIVATE_IP_RE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|localhost)/;

async function resolveGeo(ip) {
    if (!ip || PRIVATE_IP_RE.test(ip)) return null;

    const cached = _geoCache.get(ip);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    try {
        // ip-api.com — free, no key, supports batch, returns full region/state names.
        // Fields: countryCode (2-letter) | regionName (full name) | city | zip | lat | lon | timezone | isp
        const { data } = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}`, {
            params: {
                fields: 'status,countryCode,regionName,city,zip,lat,lon,timezone,isp',
            },
            timeout: 4000,
        });

        if (data?.status !== 'success') return null;

        const geo = {
            country:  data.countryCode  || null,   // 2-letter ISO: "IN"
            region:   data.regionName   || null,   // full name:    "Maharashtra"
            city:     data.city         || null,   // full name:    "Mumbai"
            zip:      data.zip          || null,
            lat:      data.lat          ?? null,
            lon:      data.lon          ?? null,
            timezone: data.timezone     || null,   // "Asia/Kolkata"
            isp:      data.isp          || null,
        };

        _geoCache.set(ip, { data: geo, expiresAt: Date.now() + GEO_TTL });
        return geo;
    } catch (_) {
        // Non-fatal — telemetry continues without full geo
        return null;
    }
}

// ── POST / ─────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { p } = req.body;
        if (!p) return res.status(400).json({ ok: false, error: 'invalid_payload' });

        let body;
        try {
            body = decryptPayload(p, TELEMETRY_SECRET);
        } catch (_) {
            return res.status(400).json({ ok: false, error: 'decryption_failed' });
        }

        if (!body.path || !body.session_id) {
            return res.status(400).json({ ok: false, error: 'missing_required_fields' });
        }

        // ── Parse User-Agent ───────────────────────────────────────────────
        const userAgent = req.headers['user-agent'] || '';
        const ua = new UAParser(userAgent).getResult();

        // ── Extract real visitor IP ────────────────────────────────────────
        const visitorIp = getVisitorIp(req);

        // ── Geo: Cloudflare/Vercel headers first (fastest, no HTTP call) ──
        // Cloudflare free provides cf-ipcountry. City/region require Workers
        // or Business plan, so we still need ip-api.com for those.
        const cfCountry = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || null;

        // ── Resolve User ID (optional JWT) ─────────────────────────────────
        let userId = null;
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id || decoded.userId || null;
            } catch (_) {}
        }

        // ── Generate record ID so we can update it after geo enrichment ───
        const id = randomUUID();

        // ── INSERT immediately with whatever we have ───────────────────────
        // ip_address, latitude, longitude, timezone, isp start NULL
        // and are filled in by the background geo lookup below.
        await query(`
            INSERT INTO telemetry (
                id, user_id, ip_address,
                session_id, path, event_type, referrer,
                browser, browser_version, engine, engine_version,
                os, os_version, device_type, device_vendor, device_model,
                cpu, ua_string,
                country, city, region,
                language, screen_size, metadata
            ) VALUES (
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?
            )
        `, [
            id, userId, visitorIp,
            body.session_id, body.path, body.event_type || 'view', body.referrer || null,
            ua.browser.name || null, ua.browser.version || null,
            ua.engine.name  || null, ua.engine.version  || null,
            ua.os.name      || null, ua.os.version      || null,
            ua.device.type  || 'desktop', ua.device.vendor || null, ua.device.model || null,
            ua.cpu.architecture || null, userAgent,
            cfCountry || null, null, null,    // country, city, region — enriched below
            body.language || null,
            body.screen_size || null,
            JSON.stringify(body.metadata || {}),
        ]);

        // ── Respond immediately — don't make the visitor wait for geo ─────
        res.status(200).json({ ok: true });

        // ── Background: enrich with full geo data ─────────────────────────
        // setImmediate runs after the current I/O event completes, so the
        // HTTP response has already been flushed before we make the API call.
        setImmediate(async () => {
            try {
                const geo = await resolveGeo(visitorIp);
                if (!geo) return;

                await query(`
                    UPDATE telemetry
                    SET
                        country   = COALESCE(country, ?),
                        city      = ?,
                        region    = ?,
                        latitude  = ?,
                        longitude = ?,
                        timezone  = ?,
                        isp       = ?
                    WHERE id = ?
                `, [
                    geo.country, geo.city, geo.region,
                    geo.lat, geo.lon, geo.timezone, geo.isp,
                    id,
                ]);
            } catch (err) {
                console.error('[telemetry] geo enrichment failed:', err.message);
            }
        });

    } catch (err) {
        console.error('[telemetry] unexpected error:', err);
        // Only send error if response hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({ ok: false, error: 'server_error' });
        }
    }
});

module.exports = router;
