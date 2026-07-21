-- SaaS support desk: tenants (NexCRM customers) raise tickets to Napnix (agency).
-- Lives in the master `napnix` DB so one agency inbox spans every tenant.
-- Tenant CRM writes here via the service-key ingest API; agency staff answer from Nexspire-admin.

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(20) UNIQUE DEFAULT NULL,

    -- Denormalised tenant identity (source of truth is the tenant CRM that opened the ticket).
    tenant_slug VARCHAR(100) NOT NULL,
    tenant_name VARCHAR(255) DEFAULT NULL,
    industry VARCHAR(50) DEFAULT NULL,

    -- Who raised it, captured from the tenant staff JWT at creation time.
    requester_user_id INT DEFAULT NULL,
    requester_name VARCHAR(255) DEFAULT NULL,
    requester_email VARCHAR(255) DEFAULT NULL,
    requester_role VARCHAR(50) DEFAULT NULL,

    subject VARCHAR(255) NOT NULL,
    category ENUM('general','billing','technical','bug','feature_request','data','account') NOT NULL DEFAULT 'general',
    priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
    status ENUM('open','in_progress','waiting_customer','resolved','closed') NOT NULL DEFAULT 'open',

    -- Agency staff (napnix.users) currently owning the ticket.
    assigned_to INT DEFAULT NULL,
    assigned_name VARCHAR(255) DEFAULT NULL,

    last_message_at TIMESTAMP NULL DEFAULT NULL,
    last_message_by ENUM('tenant','agency') DEFAULT NULL,
    resolved_at TIMESTAMP NULL DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tenant (tenant_slug),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned (assigned_to),
    INDEX idx_last_message (last_message_at)
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,

    -- 'tenant' = message from the customer's CRM; 'agency' = reply from Napnix support.
    author_type ENUM('tenant','agency') NOT NULL,
    author_id INT DEFAULT NULL,
    author_name VARCHAR(255) DEFAULT NULL,

    body TEXT NOT NULL,

    -- Agency-only note the tenant never sees (kept in the same thread for context).
    is_internal_note TINYINT(1) NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_ticket (ticket_id),
    CONSTRAINT fk_support_msg_ticket FOREIGN KEY (ticket_id)
        REFERENCES support_tickets(id) ON DELETE CASCADE
);
