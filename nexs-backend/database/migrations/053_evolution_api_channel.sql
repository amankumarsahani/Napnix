-- Add Evolution API as third WhatsApp channel
ALTER TABLE whatsapp_accounts
    MODIFY COLUMN channel ENUM('baileys', 'meta', 'evolution') NOT NULL;

ALTER TABLE whatsapp_accounts
    ADD COLUMN evolution_api_url VARCHAR(500) DEFAULT NULL AFTER meta_waba_id,
    ADD COLUMN evolution_api_key VARCHAR(500) DEFAULT NULL AFTER evolution_api_url;
