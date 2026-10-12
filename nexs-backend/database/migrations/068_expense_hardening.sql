-- Soft delete, audit trail, person FK, account, tax/currency, receipt, approval, recurring generation.
ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS spent_by_id INT DEFAULT NULL AFTER spent_by,
    ADD COLUMN IF NOT EXISTS account ENUM('bank','cash','upi','card','wallet','other') NOT NULL DEFAULT 'bank' AFTER payment_method,
    ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'INR' AFTER amount,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(500) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
    ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS recurring_parent_id INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS next_due_date DATE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS deleted_by INT DEFAULT NULL,
    ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at),
    ADD INDEX IF NOT EXISTS idx_spent_by_id (spent_by_id),
    ADD INDEX IF NOT EXISTS idx_next_due (next_due_date);

-- Link existing free-text names to people; unmatched legacy names keep spent_by only.
UPDATE expenses e JOIN expense_people p ON p.name = e.spent_by
   SET e.spent_by_id = p.id WHERE e.spent_by_id IS NULL;

-- Existing recurring rows become the template; first generated copy is due one interval after.
UPDATE expenses SET next_due_date = CASE recurring_interval
        WHEN 'monthly'   THEN DATE_ADD(date, INTERVAL 1 MONTH)
        WHEN 'quarterly' THEN DATE_ADD(date, INTERVAL 3 MONTH)
        WHEN 'yearly'    THEN DATE_ADD(date, INTERVAL 1 YEAR) END
 WHERE is_recurring = 1 AND next_due_date IS NULL AND recurring_interval IS NOT NULL;

CREATE TABLE IF NOT EXISTS expense_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    action ENUM('create','update','delete','restore','approve','reject') NOT NULL,
    user_id INT DEFAULT NULL,
    snapshot JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expense (expense_id)
);
