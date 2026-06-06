ALTER TABLE servers
ADD COLUMN IF NOT EXISTS db_port INT NOT NULL DEFAULT 3306 AFTER db_host,
ADD COLUMN IF NOT EXISTS nexcrm_backend_path VARCHAR(255) NULL AFTER db_password,
ADD COLUMN IF NOT EXISTS ecosystem_config_path VARCHAR(255) NULL AFTER nexcrm_backend_path,
ADD COLUMN IF NOT EXISTS cloudflare_config_path VARCHAR(255) NULL AFTER ecosystem_config_path;

UPDATE servers
SET db_port = 3306
WHERE db_port IS NULL OR db_port = 0;
