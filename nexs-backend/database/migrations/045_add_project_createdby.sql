-- Add createdBy column to projects table
ALTER TABLE projects ADD COLUMN createdBy INT DEFAULT NULL AFTER progress;
CREATE INDEX IF NOT EXISTS idx_project_created_by ON projects (createdBy);
