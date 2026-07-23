/**
 * Centralized Google OAuth — shared across NexCRM lead-source integrations
 * (Sheets today, Gmail later — same consent app, different scopes).
 *
 * Google OAuth redirect URIs are exact-match, so a per-tenant subdomain
 * (`<slug>-crm-api.napnix.in`) can't each register their own callback. This
 * app registration and callback live here instead, on nexs-backend's stable
 * domain. After exchanging the code for tokens, the refresh token is handed
 * off server-to-server to the originating tenant's nexcrm-backend instance —
 * nexs-backend itself never stores it.
 *
 * `state` is a signed JWT (not a raw tenant slug) so the callback can trust
 * which tenant/connection it's completing without a session — this endpoint
 * is hit directly by the user's browser, not through the authenticated API.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { google } = require('googleapis');

const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${process.env.API_URL || 'https://api.napnix.in'}/oauth/google/callback`;
const SCOPES = [
    // drive.file (not drive.readonly): lets the tenant backend list/create only
    // files the user picks or that we create ourselves — not their whole Drive.
    'https://www.googleapis.com/auth/drive.file',
    // spreadsheets (not .readonly): creating a new sheet + writing its header row
    // is a write op. Also covers the read-only polling the worker already does.
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.email' // so we can label the connection with the connected account
];
const INTERNAL_OAUTH_KEY = process.env.INTERNAL_OAUTH_KEY;

function buildOAuthClient() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        REDIRECT_URI
    );
}

// GET /oauth/google/start?state=<jwt>&tenant_api_url=<url>&return_to=<url>
router.get('/google/start', (req, res) => {
    const { state, tenant_api_url, return_to } = req.query;
    if (!state || !tenant_api_url) {
        return res.status(400).send('Missing state or tenant_api_url');
    }

    try {
        jwt.verify(state, process.env.JWT_SECRET);
    } catch {
        return res.status(400).send('Invalid or expired state');
    }

    const client = buildOAuthClient();
    const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // force refresh_token on every connect, not just the first
        scope: SCOPES,
        // tenant_api_url/return_to travel inside state's signature scope by being
        // re-embedded here rather than trusted from query params at callback time.
        state: jwt.sign(
            { ...jwt.decode(state), tenant_api_url, return_to: return_to || tenant_api_url },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        )
    });

    res.redirect(url);
});

// GET /oauth/google/callback?code=...&state=...
router.get('/google/callback', async (req, res) => {
    const { code, state, error } = req.query;

    let payload;
    try {
        payload = jwt.verify(state, process.env.JWT_SECRET);
    } catch {
        return res.status(400).send('Invalid or expired OAuth state');
    }

    const { connectionId, tenant_api_url, return_to } = payload;
    const failRedirect = `${return_to || tenant_api_url}?google_connect=failed`;

    if (error || !code) {
        return res.redirect(failRedirect);
    }

    try {
        const client = buildOAuthClient();
        const { tokens } = await client.getToken(code);

        if (!tokens.refresh_token) {
            // Happens when the user has already granted consent and Google
            // silently reauthorizes without issuing a new refresh_token.
            // `prompt: 'consent'` above should prevent this, but guard anyway.
            return res.redirect(`${failRedirect}&reason=no_refresh_token`);
        }

        client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const { data: profile } = await oauth2.userinfo.get();

        await axios.post(
            `${tenant_api_url}/api/lead-sources/google/token`,
            { connectionId, refreshToken: tokens.refresh_token, email: profile.email },
            { headers: { 'X-Internal-Key': INTERNAL_OAUTH_KEY }, timeout: 10000 }
        );

        res.redirect(`${return_to || tenant_api_url}?google_connect=success`);
    } catch (err) {
        console.error('[oauth] Google callback failed:', err.response?.data || err.message);
        res.redirect(failRedirect);
    }
});

module.exports = router;
