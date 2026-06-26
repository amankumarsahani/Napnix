const crypto = require('crypto');
const axios = require('axios');

/**
 * Meta Conversions API (server-side) service.
 *
 * Sends conversion events directly from the server to Meta, complementing the
 * browser Pixel. Improves tracking accuracy when the browser pixel is blocked
 * (ad blockers / iOS / network failures) and boosts event match quality.
 *
 * Browser + server events are deduplicated by Meta using a shared `event_id`:
 * the frontend generates an id, fires the browser Pixel with it, sends it to
 * this server in the form payload, and we forward the same id here.
 *
 * Required env:
 *   META_PIXEL_ID            - dataset/pixel id (e.g. 2073229720265884)
 *   META_CAPI_ACCESS_TOKEN   - system-user access token from Events Manager
 * Optional env:
 *   META_TEST_EVENT_CODE     - set to a TESTxxxxx code to route events to Test Events
 */

const GRAPH_VERSION = 'v21.0';

// SHA-256 hash, lowercased + trimmed, as Meta requires for PII fields.
function hash(value) {
    if (!value) return undefined;
    const normalized = String(value).trim().toLowerCase();
    if (!normalized) return undefined;
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Phone must be digits only (with country code), then hashed.
function hashPhone(value) {
    if (!value) return undefined;
    const digits = String(value).replace(/[^0-9]/g, '');
    if (!digits) return undefined;
    return crypto.createHash('sha256').update(digits).digest('hex');
}

function isConfigured() {
    return Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN);
}

/**
 * Send a single conversion event to the Meta Conversions API.
 *
 * @param {object} opts
 * @param {string} opts.eventName   - e.g. 'Lead'
 * @param {string} [opts.eventId]   - dedup id shared with the browser pixel
 * @param {string} [opts.eventSourceUrl] - page URL where the event happened
 * @param {object} [opts.user]      - { email, phone, firstName, lastName, ip, userAgent, fbp, fbc }
 * @param {object} [opts.customData]- extra event data (e.g. { content_name })
 * @returns {Promise<boolean>} true if sent, false if skipped/failed (never throws)
 */
async function sendEvent({ eventName, eventId, eventSourceUrl, user = {}, customData = {} }) {
    if (!isConfigured()) {
        // Silently no-op when not configured so the form still works.
        return false;
    }

    const userData = {
        em: hash(user.email),
        ph: hashPhone(user.phone),
        fn: hash(user.firstName),
        ln: hash(user.lastName),
        client_ip_address: user.ip,
        client_user_agent: user.userAgent,
        fbp: user.fbp,
        fbc: user.fbc,
    };
    // Strip undefined keys — Meta rejects null/undefined hashed fields.
    Object.keys(userData).forEach((k) => userData[k] === undefined && delete userData[k]);

    const eventData = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: userData,
    };
    if (eventId) eventData.event_id = eventId;
    if (eventSourceUrl) eventData.event_source_url = eventSourceUrl;
    if (customData && Object.keys(customData).length) eventData.custom_data = customData;

    const payload = { data: [eventData] };
    if (process.env.META_TEST_EVENT_CODE) {
        payload.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.META_PIXEL_ID}/events` +
        `?access_token=${encodeURIComponent(process.env.META_CAPI_ACCESS_TOKEN)}`;

    try {
        const { data } = await axios.post(url, payload, { timeout: 8000 });
        if (data && data.events_received >= 1) return true;
        console.warn('Meta CAPI: unexpected response', data);
        return false;
    } catch (err) {
        // Never break the request flow because of tracking.
        console.error('Meta CAPI send failed:', err.response?.data || err.message);
        return false;
    }
}

module.exports = { sendEvent, isConfigured };
