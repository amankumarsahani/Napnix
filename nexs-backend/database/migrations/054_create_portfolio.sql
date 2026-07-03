-- Portfolio projects — managed from the admin panel, served to the agency website.
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    category      VARCHAR(100) NOT NULL DEFAULT 'Web Platform',
    description   TEXT,
    tags          JSON,
    tech_stack    JSON,
    metric        VARCHAR(100) DEFAULT 'Live',
    client        VARCHAR(255) DEFAULT NULL,
    industry      VARCHAR(100) DEFAULT NULL,
    image_url     VARCHAR(500) DEFAULT NULL,
    accent        VARCHAR(50)  DEFAULT NULL,
    size          VARCHAR(20)  DEFAULT 'small',
    status        ENUM('published','draft') NOT NULL DEFAULT 'published',
    featured      TINYINT(1) NOT NULL DEFAULT 0,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_sort (sort_order)
);

-- Seed the real project set (idempotent via slug uniqueness).
INSERT INTO portfolio_projects
    (title, slug, category, description, tags, tech_stack, metric, industry, accent, size, status, featured, sort_order)
VALUES
    ('Taxiologists', 'taxiologists', 'Mobile App',
     'Taxi and fleet booking app with a real-time management dashboard for dispatch, driver tracking, and trip operations.',
     JSON_ARRAY('Mobile App','Dashboard','Real-time'),
     JSON_ARRAY('React Native','Node.js','MySQL'),
     'Live', 'Transport & Fleet', 'amber', 'large', 'published', 1, 10),

    ('TeleSync', 'telesync', 'Mobile App',
     'Android telecalling CRM that syncs call logs in the background and pushes activity to a live sales dashboard, modelled on Callyzer and Runo.',
     JSON_ARRAY('Mobile App','CRM','Call Sync'),
     JSON_ARRAY('Native Android','Kotlin','REST API'),
     'Live', 'Sales & Telecalling', 'emerald', 'small', 'published', 1, 20),

    ('CallStats', 'callstats', 'Mobile App',
     'Call analytics app that tracks agent call activity and surfaces performance metrics for telecalling teams.',
     JSON_ARRAY('Mobile App','Analytics'),
     JSON_ARRAY('Native Android','Kotlin'),
     'Live', 'Sales & Telecalling', 'sky', 'small', 'published', 0, 30),

    ('Meet Master', 'meet-master', 'Web Platform',
     'AI meeting recorder and summarizer with speaker labels and multi-provider AI summaries, delivered over your own SMTP with no third-party relay.',
     JSON_ARRAY('AI','Automation','Productivity'),
     JSON_ARRAY('Chrome Extension','Node.js','Multi-LLM'),
     'Live', 'Productivity', 'violet', 'wide', 'published', 1, 40),

    ('HR Management Dashboard', 'hr-management-dashboard', 'Dashboard',
     'Internal HR operations dashboard covering employees, attendance, and payroll with role-based access.',
     JSON_ARRAY('Dashboard','HR','Operations'),
     JSON_ARRAY('React','Node.js','MySQL'),
     'Live', 'Human Resources', 'rose', 'small', 'published', 0, 50),

    ('NapCRM — Manufacturing', 'napcrm-manufacturing', 'Web Platform',
     'Multi-tenant CRM deployment tailored for a manufacturing business: inventory, order pipeline, and lead management on the NexCRM stack.',
     JSON_ARRAY('CRM','SaaS','Manufacturing'),
     JSON_ARRAY('React','Express','MariaDB'),
     'Live', 'Manufacturing', 'orange', 'small', 'published', 0, 60),

    ('NapCRM — Legal', 'napcrm-legal', 'Web Platform',
     'CRM deployment for a legal firm: case and matter tracking, client records, and document workflows on the NexCRM stack.',
     JSON_ARRAY('CRM','SaaS','Legal'),
     JSON_ARRAY('React','Express','MariaDB'),
     'Live', 'Legal', 'indigo', 'small', 'published', 0, 70)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);
