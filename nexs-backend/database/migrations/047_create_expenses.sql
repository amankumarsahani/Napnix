CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100) NOT NULL DEFAULT 'Other',
    description VARCHAR(500) DEFAULT NULL,
    vendor VARCHAR(255) DEFAULT NULL,
    payment_method ENUM('cash','card','bank_transfer','upi','other') NOT NULL DEFAULT 'card',
    is_recurring TINYINT(1) NOT NULL DEFAULT 0,
    recurring_interval ENUM('monthly','quarterly','yearly') DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_category (category)
);
