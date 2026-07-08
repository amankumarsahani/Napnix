const crypto = require('crypto');

const SECRET_PREFIX = 'enc:v1:';

function getSecretMaterial() {
    return process.env.AI_SETTINGS_SECRET
        || process.env.SETTINGS_ENCRYPTION_KEY
        || process.env.ENCRYPTION_KEY
        || process.env.JWT_SECRET;
}

function getEncryptionKey() {
    const material = getSecretMaterial();
    if (!material) {
        throw new Error('AI settings encryption secret is not configured');
    }
    return crypto.createHash('sha256').update(String(material)).digest();
}

function isEncryptedSecret(value) {
    return typeof value === 'string' && value.startsWith(SECRET_PREFIX);
}

function encryptSecret(value) {
    if (value === null || value === undefined) return value;
    const plaintext = String(value);
    if (!plaintext || isEncryptedSecret(plaintext)) return plaintext;

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();

    return `${SECRET_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decryptSecret(value) {
    if (!isEncryptedSecret(value)) return value;

    const raw = value.slice(SECRET_PREFIX.length);
    const [ivB64, tagB64, encryptedB64] = raw.split(':');
    if (!ivB64 || !tagB64 || !encryptedB64) {
        throw new Error('Encrypted secret has an invalid format');
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    return Buffer.concat([
        decipher.update(Buffer.from(encryptedB64, 'base64')),
        decipher.final()
    ]).toString('utf8');
}

module.exports = {
    SECRET_PREFIX,
    encryptSecret,
    decryptSecret,
    isEncryptedSecret
};
