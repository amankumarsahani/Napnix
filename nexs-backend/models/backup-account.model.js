const { pool } = require('../config/database');

class BackupAccountModel {
    static maskSecret(value) {
        if (!value) return null;
        const str = String(value);
        if (str.length <= 8) return '********';
        return `${str.slice(0, 4)}...${str.slice(-4)}`;
    }

    static sanitizeForResponse(account) {
        if (!account) return account;

        let credentialsSummary = null;
        if (account.credentials_json) {
            try {
                const parsed = typeof account.credentials_json === 'string'
                    ? JSON.parse(account.credentials_json)
                    : account.credentials_json;
                credentialsSummary = parsed?.client_email || 'configured';
            } catch (error) {
                credentialsSummary = 'configured';
            }
        }

        return {
            id: account.id,
            account_name: account.account_name,
            auth_type: account.auth_type,
            folder_id: account.folder_id,
            subject_email: account.subject_email,
            oauth_client_id: account.oauth_client_id || null,
            is_active: account.is_active,
            usage_count: account.usage_count,
            created_at: account.created_at,
            updated_at: account.updated_at,
            credentials_configured: Boolean(account.credentials_json),
            credentials_summary: credentialsSummary,
            oauth_client_secret_configured: Boolean(account.oauth_client_secret),
            oauth_refresh_token_configured: Boolean(account.oauth_refresh_token),
            oauth_refresh_token_preview: this.maskSecret(account.oauth_refresh_token)
        };
    }
    /**
     * Get all backup accounts
     */
    static async findAll(options = {}) {
        const { includeSecrets = false } = options;
        const [rows] = await pool.query(`
            SELECT *
            FROM backup_accounts
        `);
        return includeSecrets ? rows : rows.map(row => this.sanitizeForResponse(row));
    }

    /**
     * Get account with secrets (internal use)
     */
    static async findById(id, options = {}) {
        const { includeSecrets = false } = options;
        const [rows] = await pool.query('SELECT * FROM backup_accounts WHERE id = ?', [id]);
        const account = rows[0];
        return includeSecrets ? account : this.sanitizeForResponse(account);
    }

    /**
     * Get the next account to use (load balance/rotation)
     */
    static async getNextAccount() {
        const [rows] = await pool.query(`
            SELECT * FROM backup_accounts 
            WHERE is_active = TRUE 
            ORDER BY usage_count ASC 
            LIMIT 1
        `);
        return rows[0];
    }

    /**
     * Increment usage count
     */
    static async incrementUsage(id) {
        await pool.query('UPDATE backup_accounts SET usage_count = usage_count + 1 WHERE id = ?', [id]);
    }

    /**
     * Create backup account
     */
    static async create(data) {
        const {
            account_name,
            auth_type = 'service_account',
            credentials_json,
            folder_id,
            subject_email,
            oauth_client_id,
            oauth_client_secret,
            oauth_refresh_token
        } = data;

        const normalizedAuthType = auth_type === 'oauth_personal' ? 'oauth_personal' : 'service_account';
        const serializedCredentials = normalizedAuthType === 'service_account' && credentials_json
            ? (typeof credentials_json === 'string' ? credentials_json : JSON.stringify(credentials_json))
            : null;

        const [result] = await pool.query(`
            INSERT INTO backup_accounts (
                account_name,
                auth_type,
                credentials_json,
                folder_id,
                subject_email,
                oauth_client_id,
                oauth_client_secret,
                oauth_refresh_token
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            account_name,
            normalizedAuthType,
            serializedCredentials,
            folder_id,
            subject_email || null,
            normalizedAuthType === 'oauth_personal' ? oauth_client_id || null : null,
            normalizedAuthType === 'oauth_personal' ? oauth_client_secret || null : null,
            normalizedAuthType === 'oauth_personal' ? oauth_refresh_token || null : null
        ]);
        return result.insertId;
    }

    /**
     * Update backup account
     */
    static async update(id, data) {
        const {
            account_name,
            auth_type = 'service_account',
            credentials_json,
            folder_id,
            subject_email,
            oauth_client_id,
            oauth_client_secret,
            oauth_refresh_token
        } = data;

        const normalizedAuthType = auth_type === 'oauth_personal' ? 'oauth_personal' : 'service_account';
        const serializedCredentials = normalizedAuthType === 'service_account' && credentials_json
            ? (typeof credentials_json === 'string' ? credentials_json : JSON.stringify(credentials_json))
            : null;

        await pool.query(`
            UPDATE backup_accounts 
            SET
                account_name = ?,
                auth_type = ?,
                credentials_json = ?,
                folder_id = ?,
                subject_email = ?,
                oauth_client_id = ?,
                oauth_client_secret = ?,
                oauth_refresh_token = ?
            WHERE id = ?
        `, [
            account_name,
            normalizedAuthType,
            serializedCredentials,
            folder_id,
            subject_email || null,
            normalizedAuthType === 'oauth_personal' ? oauth_client_id || null : null,
            normalizedAuthType === 'oauth_personal' ? oauth_client_secret || null : null,
            normalizedAuthType === 'oauth_personal' ? oauth_refresh_token || null : null,
            id
        ]);
    }

    /**
     * Delete backup account
     */
    static async delete(id) {
        await pool.query('DELETE FROM backup_accounts WHERE id = ?', [id]);
    }

    /**
     * Add backup history record
     */
    static async addHistory(data) {
        const { tenant_id, server_id, file_name, gdrive_file_id, backup_account_id, status, error_message, file_size_bytes } = data;
        const [result] = await pool.query(`
            INSERT INTO backup_history (
                tenant_id, server_id, file_name, gdrive_file_id, 
                backup_account_id, status, error_message, file_size_bytes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [tenant_id, server_id, file_name, gdrive_file_id, backup_account_id, status, error_message, file_size_bytes]);
        return result.insertId;
    }

    /**
     * Get backups older than 15 days for a specific account
     */
    static async getExpiredBackups(days = 15) {
        const [rows] = await pool.query(`
            SELECT * FROM backup_history 
            WHERE status = 'success' 
            AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `, [days]);
        return rows;
    }

    /**
     * Delete history record (after GDrive deletion)
     */
    static async deleteHistory(id) {
        await pool.query('DELETE FROM backup_history WHERE id = ?', [id]);
    }
}

module.exports = BackupAccountModel;
