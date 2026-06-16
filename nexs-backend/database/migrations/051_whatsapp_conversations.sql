-- WhatsApp conversations + messages for Napnix-owned accounts

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    account_id      INT NOT NULL,
    contact_jid     VARCHAR(50) NOT NULL,
    contact_name    VARCHAR(150) DEFAULT NULL,
    contact_phone   VARCHAR(30) DEFAULT NULL,
    last_message    TEXT DEFAULT NULL,
    last_message_at TIMESTAMP NULL,
    unread_count    INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_account_contact (account_id, contact_jid),
    INDEX idx_account (account_id),
    FOREIGN KEY (account_id) REFERENCES whatsapp_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    account_id      INT NOT NULL,
    message_id      VARCHAR(100) DEFAULT NULL,
    direction       ENUM('inbound','outbound') NOT NULL,
    body            TEXT DEFAULT NULL,
    media_url       VARCHAR(500) DEFAULT NULL,
    media_type      ENUM('text','image','video','audio','document') NOT NULL DEFAULT 'text',
    status          ENUM('sent','delivered','read','failed') DEFAULT 'sent',
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (conversation_id),
    FOREIGN KEY (conversation_id) REFERENCES whatsapp_conversations(id) ON DELETE CASCADE
);
