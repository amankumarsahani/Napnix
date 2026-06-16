const axios = require('axios');
const crypto = require('crypto');

const WA_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5100';
const WA_SERVICE_KEY = process.env.WHATSAPP_SERVICE_KEY;
const ENCRYPT_SECRET = process.env.META_TOKEN_SECRET || process.env.JWT_SECRET;

const waClient = axios.create({
    baseURL: WA_SERVICE_URL,
    headers: { 'x-service-key': WA_SERVICE_KEY },
    timeout: 15000,
});

// ── Encryption for Meta tokens stored in DB ───────────────

function encryptToken(plain) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPT_SECRET, 'nexs-wa-salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptToken(stored) {
    const [ivHex, encHex] = stored.split(':');
    const key = crypto.scryptSync(ENCRYPT_SECRET, 'nexs-wa-salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(ivHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
}

// ── Session ID helpers ────────────────────────────────────

function makeSessionId(ownerType, ownerId, accountId) {
    return ownerType === 'napnix'
        ? `napnix_${accountId}`
        : `tenant_${ownerId}_${accountId}`;
}

// ── nexs-whatsapp proxy calls ─────────────────────────────

async function startSession(sessionId) {
    const { data } = await waClient.post('/session/start', { sessionId });
    return data;
}

async function disconnectSession(sessionId) {
    const { data } = await waClient.delete(`/session/${sessionId}`);
    return data;
}

async function getSessionStatus(sessionId) {
    const { data } = await waClient.get(`/session/status/${sessionId}`);
    return data;
}

async function sendText(sessionId, to, message) {
    const { data } = await waClient.post('/send/text', { sessionId, to, message });
    return data;
}

async function sendMedia(sessionId, to, mediaUrl, caption, mediaType) {
    const { data } = await waClient.post('/send/media', { sessionId, to, mediaUrl, caption, mediaType });
    return data;
}

async function sendMetaText(token, phoneNumberId, to, message) {
    const plain = decryptToken(token);
    const { data } = await waClient.post('/meta/send/text', { token: plain, phoneNumberId, to, message });
    return data;
}

async function sendMetaTemplate(token, phoneNumberId, to, templateName, languageCode, components) {
    const plain = decryptToken(token);
    const { data } = await waClient.post('/meta/send/template', {
        token: plain, phoneNumberId, to, templateName, languageCode, components
    });
    return data;
}

async function getMetaTemplates(token, wabaId) {
    const plain = decryptToken(token);
    const { data } = await waClient.get('/meta/templates', { params: { token: plain, wabaId } });
    return data;
}

async function testMetaCredentials(token, phoneNumberId) {
    const { data } = await waClient.post('/meta/test', { token, phoneNumberId });
    return data;
}

module.exports = {
    encryptToken,
    decryptToken,
    makeSessionId,
    startSession,
    disconnectSession,
    getSessionStatus,
    sendText,
    sendMedia,
    sendMetaText,
    sendMetaTemplate,
    getMetaTemplates,
    testMetaCredentials,
};
