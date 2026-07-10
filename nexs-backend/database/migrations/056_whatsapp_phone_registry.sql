-- Maps a WhatsApp Cloud API phone_number_id to the tenant that owns it, so the
-- single central Meta webhook (one Meta App serves every tenant's number) knows
-- which tenant's nexcrm-backend instance to forward an inbound message to.
CREATE TABLE IF NOT EXISTS whatsapp_phone_registry (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    meta_phone_id   VARCHAR(64) NOT NULL UNIQUE,
    tenant_slug     VARCHAR(150) NOT NULL,
    tenant_api_url  VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_slug (tenant_slug)
);
