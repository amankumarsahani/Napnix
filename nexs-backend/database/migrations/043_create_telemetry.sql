-- 20260504_create_telemetry.sql

CREATE TABLE IF NOT EXISTS telemetry (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NULL, 
  session_id      CHAR(36) NOT NULL,                                 
  
  -- Core Event Data
  path            TEXT NOT NULL,                                 
  event_type      VARCHAR(50) NOT NULL DEFAULT 'view',                 
  
  -- Context (Parsed on Server)
  referrer        TEXT,                                         
  browser         VARCHAR(100),                                 -- Chrome, Safari
  browser_version VARCHAR(50),                                  -- 147.0.0.0
  engine          VARCHAR(100),                                 -- Blink, WebKit
  engine_version  VARCHAR(50),                                  -- Engine Version
  os              VARCHAR(100),                                 
  os_version      VARCHAR(50),                                  
  device_type     VARCHAR(50),                                  -- mobile, desktop, tablet
  device_vendor   VARCHAR(100),                                 -- Apple, Samsung
  device_model    VARCHAR(100),                                 
  cpu             VARCHAR(50),                                  -- amd64, arm64
  ua_string       TEXT,                                         -- Raw User-Agent string
  
  -- Location (via Headers)
  country         VARCHAR(100),
  city            VARCHAR(100),
  region          VARCHAR(100),
  
  -- Client Info
  language        VARCHAR(50),                                         
  screen_size     VARCHAR(50),                                         
  
  -- Flexible Data
  metadata        JSON,                           
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for Dashboard Performance
CREATE INDEX idx_telemetry_path       ON telemetry(path(255));
CREATE INDEX idx_telemetry_event_type ON telemetry(event_type);
CREATE INDEX idx_telemetry_session_id ON telemetry(session_id);
CREATE INDEX idx_telemetry_created_at ON telemetry(created_at);
CREATE INDEX idx_telemetry_user_id    ON telemetry(user_id);
CREATE INDEX idx_telemetry_country    ON telemetry(country);
CREATE INDEX idx_telemetry_browser    ON telemetry(browser);
CREATE INDEX idx_telemetry_os         ON telemetry(os);
CREATE INDEX idx_telemetry_device     ON telemetry(device_type);
