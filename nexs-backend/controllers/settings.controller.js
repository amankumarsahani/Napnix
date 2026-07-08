/**
 * Settings Controller
 * Manages system settings stored in the database
 */

const db = require('../config/database');
const { decryptSecret, encryptSecret } = require('../services/secretStore');

const AI_PROVIDER_SETTING_KEYS = new Set([
    'openai_api_key',
    'gemini_api_key',
    'groq_api_key',
    'grok_api_key'
]);

function maskApiKey(value) {
    if (!value) return '****';
    if (value.length > 8) return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    return '****';
}

// Get all system settings (Admin only)
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT setting_key, setting_value FROM settings');

        // Transform array into an object for easier frontend consumption
        const settingsMap = {};
        settings.forEach(s => {
            // Mask sensitive data like API keys and SMTP passwords
            if ((s.setting_key.includes('_api_key') || s.setting_key === 'smtp_password') && s.setting_value) {
                if (s.setting_key.includes('_api_key')) {
                    try {
                        settingsMap[s.setting_key] = maskApiKey(decryptSecret(s.setting_value));
                    } catch {
                        settingsMap[s.setting_key] = 'configured';
                    }
                } else {
                    settingsMap[s.setting_key] = '****';
                }
            } else if (s.setting_key === 'google_service_account_json' && s.setting_value) {
                try {
                    const parsed = JSON.parse(s.setting_value);
                    settingsMap[s.setting_key] = `configured (${parsed.client_email || 'service account'})`;
                } catch {
                    settingsMap[s.setting_key] = 'configured';
                }
            } else {
                settingsMap[s.setting_key] = s.setting_value;
            }
        });

        res.json({ success: true, data: settingsMap });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
};

// Get public settings (for pricing page, etc.)
exports.getPublicSettings = async (req, res) => {
    try {
        const publicKeys = [
            'pricing_page_mode',
            'contact_sales_email',
            'billing_provider'
        ];

        const [settings] = await db.query(
            'SELECT setting_key, setting_value FROM settings WHERE setting_key IN (?)',
            [publicKeys]
        );

        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.setting_key] = s.setting_value;
        });

        res.json({ success: true, data: settingsMap });
    } catch (error) {
        console.error('Get public settings error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
};

// Update multiple settings at once
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expects { key: value, key2: value2 }

        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ success: false, error: 'Invalid settings format' });
        }

        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return res.status(400).json({ success: false, error: 'No settings provided' });
        }

        // Use a transaction for consistency
        const connection = await db.pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const key of keys) {
                const value = updates[key];

                // Skip masked values — don't overwrite with placeholder
                if (key.includes('_api_key') && value && value.includes('...')) continue;
                if (key === 'smtp_password' && value === '****') continue;
                const valueToStore = AI_PROVIDER_SETTING_KEYS.has(key) && value ? encryptSecret(value) : value;

                await connection.query(
                    `INSERT INTO settings (setting_key, setting_value) 
                     VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
                    [key, valueToStore]
                );
            }

            await connection.commit();

            if (keys.some(k => k.startsWith('smtp_'))) {
                try { require('../services/email.service').reload(); } catch (_) {}
            }

            res.json({ success: true, message: 'Settings updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
};

// Test SMTP Connection
exports.testSmtpConnection = async (req, res) => {
    const nodemailer = require('nodemailer');
    const { host, port, secure, username, password } = req.body;

    if (!host || !username || !password) {
        return res.status(400).json({ success: false, error: 'Host, username, and password are required' });
    }

    let finalPassword = password;
    if (password === '****') {
        const [[setting]] = await db.query(
            'SELECT setting_value FROM settings WHERE setting_key = ?', ['smtp_password']
        );
        if (!setting) return res.status(400).json({ success: false, error: 'No SMTP password saved' });
        finalPassword = setting.setting_value;
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port: parseInt(port) || 587,
            secure: !!secure,
            auth: { user: username, pass: finalPassword }
        });
        await transporter.verify();
        res.json({ success: true, message: 'SMTP connection successful!' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Test AI Provider Connection
exports.testAIConnection = async (req, res) => {
    try {
        const { provider, apiKey } = req.body;

        if (!provider || !apiKey) {
            return res.status(400).json({ success: false, error: 'Provider and API Key are required' });
        }

        // If apiKey is masked, fetch the real one from DB
        let finalApiKey = apiKey;
        if (apiKey.includes('...')) {
            const [[setting]] = await db.query(
                'SELECT setting_value FROM settings WHERE setting_key = ?',
                [`${provider}_api_key`]
            );
            if (!setting) {
                return res.status(404).json({ success: false, error: 'API Key not found in settings' });
            }
            finalApiKey = decryptSecret(setting.setting_value);
        }

        const axios = require('axios');

        if (provider === 'openai') {
            try {
                await axios.get('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${finalApiKey}` }
                });
                return res.json({ success: true, message: 'OpenAI connection successful' });
            } catch (err) {
                return res.status(400).json({ success: false, error: `OpenAI connection failed: ${err.response?.data?.error?.message || err.message}` });
            }
        } else if (provider === 'gemini') {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${finalApiKey}`;
                await axios.get(url);
                return res.json({ success: true, message: 'Gemini connection successful' });
            } catch (err) {
                return res.status(400).json({ success: false, error: `Gemini connection failed: ${err.response?.data?.error?.message || err.message}` });
            }
        } else if (provider === 'groq') {
            try {
                await axios.get('https://api.groq.com/openai/v1/models', {
                    headers: { 'Authorization': `Bearer ${finalApiKey}` }
                });
                return res.json({ success: true, message: 'Groq connection successful' });
            } catch (err) {
                return res.status(400).json({ success: false, error: `Groq connection failed: ${err.response?.data?.error?.message || err.message}` });
            }
        } else if (provider === 'grok') {
            try {
                await axios.get('https://api.x.ai/v1/models', {
                    headers: { 'Authorization': `Bearer ${finalApiKey}` }
                });
                return res.json({ success: true, message: 'xAI Grok connection successful' });
            } catch (err) {
                return res.status(400).json({ success: false, error: `xAI Grok connection failed: ${err.response?.data?.error?.message || err.message}` });
            }
        } else {
            return res.status(400).json({ success: false, error: 'Unsupported provider' });
        }
    } catch (error) {
        console.error('Test AI connection error:', error);
        res.status(500).json({ success: false, error: 'Failed to test connection' });
    }
};
