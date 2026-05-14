-- Allow paused subscriptions for admin pause/resume controls
ALTER TABLE subscriptions
MODIFY COLUMN status ENUM('active', 'paused', 'past_due', 'cancelled', 'expired') DEFAULT 'active';
