ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS type ENUM('expense','deposit') NOT NULL DEFAULT 'expense' AFTER id,
    ADD COLUMN IF NOT EXISTS reference VARCHAR(255) DEFAULT NULL AFTER notes,
    ADD INDEX IF NOT EXISTS idx_type (type);
