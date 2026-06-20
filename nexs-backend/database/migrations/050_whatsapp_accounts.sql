-- WhatsApp accounts for Napnix (agency-level)
-- Tenant accounts are stored in nexcrm_<slug>.whatsapp_accounts (separate migration)

CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    owner_type      ENUM('napnix', 'tenant') NOT NULL DEFAULT 'napnix',
    owner_id        VARCHAR(100) DEFAULT NULL,       -- tenant_slug if owner_type='tenant', NULL for napnix
    channel         ENUM('baileys', 'meta') NOT NULL,
    label           VARCHAR(100) NOT NULL,            -- "Support", "Sales", "Marketing"
    phone           VARCHAR(30) DEFAULT NULL,
    session_id      VARCHAR(150) DEFAULT NULL,        -- baileys: 'napnix_support_1' | 'tenant_acme_1'
    meta_phone_id   VARCHAR(100) DEFAULT NULL,
    meta_token      TEXT DEFAULT NULL,                -- encrypted
    meta_waba_id    VARCHAR(100) DEFAULT NULL,
    status          ENUM('connected','disconnected','pending_qr','reconnecting') NOT NULL DEFAULT 'disconnected',
    webhook_url     VARCHAR(500) DEFAULT NULL,        -- optional: forward incoming msgs to this URL
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner (owner_type, owner_id),
    INDEX idx_session (session_id),
    INDEX idx_status (status)
);
