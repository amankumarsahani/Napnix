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

// Lead-sources (Sheets/Drive) flow scopes.
const SHEETS_SCOPES = [
    // drive.file (not drive.readonly): lets the tenant backend list/create only
    // files the user picks or that we create ourselves — not their whole Drive.
    'https://www.googleapis.com/auth/drive.file',
    // spreadsheets (not .readonly): creating a new sheet + writing its header row
    // is a write op. Also covers the read-only polling the worker already does.
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.email' // so we can label the connection with the connected account
];

// Connected-mailbox (Gmail) flow scopes — SEND ONLY. gmail.send is a *sensitive*
// scope (standard OAuth verification, NO paid CASA assessment). Receiving would
// need gmail.readonly/modify (RESTRICTED → CASA), which we deliberately avoid;
// receive a Gmail mailbox via IMAP app-password instead.
const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email'
];

// Which tenant endpoint receives the refresh token, per flow.
const TOKEN_PATHS = {
    sheets: '/api/lead-sources/google/token',
    mailbox_gmail: '/api/mailbox/oauth/token'
};

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

    // flow travels inside the signed state (set by the tenant connect-url builder).
    // Default to the sheets flow for backward compatibility with lead-sources.
    // Strip exp/iat from the decoded claims — the incoming state was signed with
    // its own expiry, and re-signing with expiresIn while exp is present throws.
    const { exp, iat, ...decoded } = jwt.decode(state) || {};
    const isMailbox = decoded.flow === 'mailbox_gmail';

    const client = buildOAuthClient();
    const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // force refresh_token on every connect, not just the first
        scope: isMailbox ? GMAIL_SCOPES : SHEETS_SCOPES,
        // tenant_api_url/return_to travel inside state's signature scope by being
        // re-embedded here rather than trusted from query params at callback time.
        state: jwt.sign(
            { ...decoded, tenant_api_url, return_to: return_to || tenant_api_url },
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

    const { connectionId, tenant_api_url, return_to, flow } = payload;
    const isMailbox = flow === 'mailbox_gmail';
    const successKey = isMailbox ? 'mailbox_connect' : 'google_connect';
    const failRedirect = `${return_to || tenant_api_url}?${successKey}=failed`;

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

        const tokenPath = isMailbox ? TOKEN_PATHS.mailbox_gmail : TOKEN_PATHS.sheets;
        const tokenBody = isMailbox
            ? { connectionId, provider: 'gmail', refreshToken: tokens.refresh_token, email: profile.email, displayName: profile.name }
            : { connectionId, refreshToken: tokens.refresh_token, email: profile.email };

        await axios.post(
            `${tenant_api_url}${tokenPath}`,
            tokenBody,
            { headers: { 'X-Internal-Key': INTERNAL_OAUTH_KEY }, timeout: 10000 }
        );

        res.redirect(`${return_to || tenant_api_url}?${successKey}=success`);
    } catch (err) {
        console.error('[oauth] Google callback failed:', err.response?.data || err.message);
        res.redirect(failRedirect);
    }
});

/* ------------------------------------------------------------------ */
/* Microsoft 365 / Outlook — mailbox connect                            */
/* ------------------------------------------------------------------ */

const { ConfidentialClientApplication } = require('@azure/msal-node');

const MS_REDIRECT_URI = process.env.MS_OAUTH_REDIRECT_URI || `${process.env.API_URL || 'https://api.napnix.in'}/oauth/microsoft/callback`;
const MS_SCOPES = ['offline_access', 'https://graph.microsoft.com/Mail.ReadWrite', 'https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/User.Read'];

function msalApp() {
    return new ConfidentialClientApplication({
        auth: {
            clientId: process.env.MS_OAUTH_CLIENT_ID,
            clientSecret: process.env.MS_OAUTH_CLIENT_SECRET,
            authority: `https://login.microsoftonline.com/${process.env.MS_OAUTH_TENANT || 'common'}`
        }
    });
}

// GET /oauth/microsoft/start?state=<jwt>&tenant_api_url=<url>&return_to=<url>
router.get('/microsoft/start', async (req, res) => {
    const { state, tenant_api_url, return_to } = req.query;
    if (!state || !tenant_api_url) return res.status(400).send('Missing state or tenant_api_url');

    try { jwt.verify(state, process.env.JWT_SECRET); }
    catch { return res.status(400).send('Invalid or expired state'); }

    try {
        const { exp, iat, ...decoded } = jwt.decode(state) || {};
        const embeddedState = jwt.sign(
            { ...decoded, tenant_api_url, return_to: return_to || tenant_api_url },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );
        const url = await msalApp().getAuthCodeUrl({
            scopes: MS_SCOPES,
            redirectUri: MS_REDIRECT_URI,
            state: embeddedState,
            prompt: 'consent'
        });
        res.redirect(url);
    } catch (err) {
        console.error('[oauth] Microsoft start failed:', err.message);
        res.status(500).send('Failed to start Microsoft consent');
    }
});

// GET /oauth/microsoft/callback?code=...&state=...
router.get('/microsoft/callback', async (req, res) => {
    const { code, state, error } = req.query;

    let payload;
    try { payload = jwt.verify(state, process.env.JWT_SECRET); }
    catch { return res.status(400).send('Invalid or expired OAuth state'); }

    const { connectionId, tenant_api_url, return_to } = payload;
    const failRedirect = `${return_to || tenant_api_url}?mailbox_connect=failed`;
    if (error || !code) return res.redirect(failRedirect);

    try {
        // One app instance so we can read its token cache after the exchange.
        const app = msalApp();
        const result = await app.acquireTokenByCode({
            code,
            scopes: MS_SCOPES,
            redirectUri: MS_REDIRECT_URI
        });

        const refreshToken = extractRefreshToken(app);
        if (!refreshToken) {
            return res.redirect(`${failRedirect}&reason=no_refresh_token`);
        }

        const email = result.account?.username || '';
        const displayName = result.account?.name || null;

        await axios.post(
            `${tenant_api_url}/api/mailbox/oauth/token`,
            { connectionId, provider: 'microsoft', refreshToken, email, displayName },
            { headers: { 'X-Internal-Key': INTERNAL_OAUTH_KEY }, timeout: 10000 }
        );

        res.redirect(`${return_to || tenant_api_url}?mailbox_connect=success`);
    } catch (err) {
        console.error('[oauth] Microsoft callback failed:', err.response?.data || err.message);
        res.redirect(failRedirect);
    }
});

/**
 * msal-node does not return the refresh token on the result object (it manages
 * caching internally). The supported way to obtain it for our own server-to-server
 * relay to the tenant backend is to serialize the app's in-memory token cache
 * right after the code exchange and read the RefreshToken entry.
 */
function extractRefreshToken(app) {
    try {
        const cache = JSON.parse(app.getTokenCache().serialize());
        const rt = cache.RefreshToken || {};
        const first = Object.values(rt)[0];
        return first?.secret || null;
    } catch (err) {
        console.error('[oauth] Failed to read MS refresh token from cache:', err.message);
        return null;
    }
}

module.exports = router;
