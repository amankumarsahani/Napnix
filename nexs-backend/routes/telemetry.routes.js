const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { decryptPayload } = require('../utils/telemetry-crypto');
const { UAParser } = require('ua-parser-js');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

const TELEMETRY_SECRET = process.env.PUBLIC_CRYPTO_SECRET || process.env.VITE_PUBLIC_CRYPTO_SECRET || "";

router.post('/', async (req, res) => {
    try {
        const { p } = req.body;
        if (!p) {
            return res.status(400).json({ ok: false, error: 'invalid_payload' });
        }

        // Decrypt the obfuscated payload
        let body;
        try {
            body = decryptPayload(p, TELEMETRY_SECRET);
        } catch (err) {
            return res.status(400).json({ ok: false, error: 'decryption_failed' });
        }

        // 1. Resolve User-Agent & Geo-Location
        const userAgent = req.headers['user-agent'] || '';
        const parser = new UAParser(userAgent);
        const ua = parser.getResult();

        // Support standard headers, Vercel, and Cloudflare
        let country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || null;
        let city = req.headers['x-vercel-ip-city'] || req.headers['cf-ipcity'] || null;
        let region = req.headers['x-vercel-ip-country-region'] || req.headers['cf-region-code'] || req.headers['cf-region'] || null;

        // Fallback: Local IP lookup (if not on Vercel/Cloudflare)
        if (!country || !city) {
            const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
            const geo = geoip.lookup(ip);
            if (geo) {
                country = country || geo.country;
                city = city || geo.city;
                region = region || geo.region;
            }
        }

        // 2. Resolve User ID (Optional - from JWT)
        let userId = null;
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id || decoded.userId || null;
            } catch (err) {
                // Ignore invalid token for telemetry
            }
        }

        // 3. Validation
        if (!body.path || !body.session_id) {
            return res.status(400).json({ ok: false, error: 'missing_required_fields' });
        }

        // 4. Insert into DB
        const sql = `
            INSERT INTO telemetry (
                user_id, session_id, path, event_type, referrer,
                browser, browser_version, engine, engine_version,
                os, os_version, device_type, device_vendor, device_model,
                cpu, ua_string, country, city, region,
                language, screen_size, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userId,
            body.session_id,
            body.path,
            body.event_type || 'view',
            body.referrer || null,
            ua.browser.name || null,
            ua.browser.version || null,
            ua.engine.name || null,
            ua.engine.version || null,
            ua.os.name || null,
            ua.os.version || null,
            ua.device.type || 'desktop',
            ua.device.vendor || null,
            ua.device.model || null,
            ua.cpu.architecture || null,
            userAgent,
            country,
            city ? decodeURIComponent(city) : null,
            region,
            body.language || null,
            body.screen_size || null,
            JSON.stringify(body.metadata || {})
        ];

        await query(sql, params);

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Unexpected error in /api/telemetry:', err);
        return res.status(500).json({ ok: false, error: 'server_error' });
    }
});

module.exports = router;
