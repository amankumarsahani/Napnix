-- Time-series metrics for the admin /monitoring dashboard.
-- Per-check tenant metrics come from the tenant's /api/internal/health/deep,
-- host + PM2 process samples from the 5-minute `pm2 jlist` pass.

ALTER TABLE tenant_health_checks ADD COLUMN db_latency_ms INT NULL;
ALTER TABLE tenant_health_checks ADD COLUMN memory_rss_mb INT NULL;
ALTER TABLE tenant_health_checks ADD COLUMN requests_5m INT NULL;
ALTER TABLE tenant_health_checks ADD COLUMN errors_4xx_5m INT NULL;
ALTER TABLE tenant_health_checks ADD COLUMN errors_5xx_5m INT NULL;

CREATE TABLE IF NOT EXISTS server_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NULL,
    server_name VARCHAR(100) NOT NULL,
    checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    load1 DECIMAL(6,2) NULL,
    load5 DECIMAL(6,2) NULL,
    load15 DECIMAL(6,2) NULL,
    cpu_count INT NULL,
    mem_total_mb INT NULL,
    mem_used_mb INT NULL,
    disk_total_gb INT NULL,
    disk_used_gb INT NULL,
    processes JSON NULL,
    INDEX idx_server_time (server_name, checked_at),
    INDEX idx_checked (checked_at)
);
