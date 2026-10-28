-- Tenant health + security monitoring (workers/tenantMonitorWorker.js).
-- PRD: nexcrm-backend/docs/PRD_tenant_monitoring.md

CREATE TABLE IF NOT EXISTS tenant_health_checks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ok TINYINT(1) NOT NULL,
    http_status SMALLINT NULL,
    latency_ms INT NULL,
    db_ok TINYINT(1) NULL,
    error VARCHAR(255) NULL,
    INDEX idx_tenant_time (tenant_id, checked_at),
    INDEX idx_checked (checked_at)
);

CREATE TABLE IF NOT EXISTS tenant_monitor_state (
    tenant_id INT PRIMARY KEY,
    health ENUM('up', 'degraded', 'down', 'unknown') NOT NULL DEFAULT 'unknown',
    consecutive_failures INT NOT NULL DEFAULT 0,
    last_ok_at DATETIME NULL,
    last_check_at DATETIME NULL,
    last_latency_ms INT NULL,
    last_error VARCHAR(255) NULL,
    memory_rss_mb INT NULL,
    errors_5xx_5m INT NULL,
    errors_4xx_5m INT NULL,
    pm2_status VARCHAR(20) NULL,
    pm2_restarts INT NULL,
    pm2_memory_mb INT NULL,
    pm2_checked_at DATETIME NULL,
    security_feed ENUM('ok', 'unsupported', 'error', 'unknown') NOT NULL DEFAULT 'unknown',
    security_checked_at DATETIME NULL,
    security_ok_at DATETIME NULL,
    last_down_alert_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Health and security rule hits in one list. tenant_id is NULL for server-level
-- events (SSH unreachable). A hit for the same tenant/server + rule + subject seen
-- again within the rule's cooldown updates the existing row instead of adding one,
-- so re-evaluating the same window never creates a second row or email.
CREATE TABLE IF NOT EXISTS tenant_monitor_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NULL,
    server_id INT NULL,
    category ENUM('health', 'security') NOT NULL,
    rule VARCHAR(40) NOT NULL,
    subject VARCHAR(191) NOT NULL DEFAULT '',
    severity ENUM('info', 'low', 'medium', 'high', 'critical') NOT NULL,
    summary VARCHAR(255) NOT NULL,
    details JSON NULL,
    first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    occurrences INT NOT NULL DEFAULT 1,
    emailed_at DATETIME NULL,
    acknowledged_by INT NULL,
    acknowledged_at DATETIME NULL,
    INDEX idx_dedupe (tenant_id, rule, subject, last_seen_at),
    INDEX idx_server_dedupe (server_id, rule, last_seen_at),
    INDEX idx_last_seen (last_seen_at),
    INDEX idx_open (acknowledged_at, severity)
);

-- Countries each tenant admin/manager has logged in from, for the
-- admin_new_country rule. user_id only, no email or IP stored here.
CREATE TABLE IF NOT EXISTS tenant_login_countries (
    tenant_id INT NOT NULL,
    user_id INT NOT NULL,
    country CHAR(2) NOT NULL,
    first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, user_id, country)
);
