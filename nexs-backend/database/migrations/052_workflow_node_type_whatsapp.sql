-- Add 'whatsapp' to workflow_nodes.node_type ENUM
ALTER TABLE workflow_nodes
    MODIFY COLUMN node_type ENUM('trigger', 'action', 'condition', 'delay', 'whatsapp') NOT NULL;
