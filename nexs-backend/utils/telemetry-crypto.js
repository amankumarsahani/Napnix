const crypto = require('crypto');

/**
 * SERVER-SIDE Decryption (using Node.js crypto)
 * Works in Node.js environment.
 */
function decryptPayload(encryptedStr, secretHex) {
    try {
        const [ivB64, tagB64, ciphertextB64] = encryptedStr.split(':');

        const iv = Buffer.from(ivB64, 'base64');
        const tag = Buffer.from(tagB64, 'base64');
        const ciphertext = Buffer.from(ciphertextB64, 'base64');
        const key = Buffer.from(secretHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]);

        return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
        console.error('Decryption failed:', error.message);
        throw new Error('invalid_payload');
    }
}

module.exports = { decryptPayload };
