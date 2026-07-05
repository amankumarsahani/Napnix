-- Case studies — managed from the admin panel, served to the agency /portfolio/:slug pages.
-- slug matches a portfolio_projects.slug; only projects with a case study get a detail page.
CREATE TABLE IF NOT EXISTS case_studies (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    title         VARCHAR(255) NOT NULL,
    category      VARCHAR(150) DEFAULT NULL,
    accent        VARCHAR(50)  DEFAULT 'amber',
    summary       TEXT,
    tech          JSON,
    problem       JSON,
    solution      JSON,
    system_flow   JSON,
    impact        JSON,
    quote_text    TEXT DEFAULT NULL,
    quote_author  VARCHAR(255) DEFAULT NULL,
    quote_role    VARCHAR(255) DEFAULT NULL,
    status        ENUM('published','draft') NOT NULL DEFAULT 'published',
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cs_status (status),
    INDEX idx_cs_sort (sort_order)
);

-- Seed the three existing case studies (idempotent via slug uniqueness).
INSERT INTO case_studies
    (slug, title, category, accent, summary, tech, problem, solution, system_flow, impact, quote_text, quote_author, quote_role, status, sort_order)
VALUES
    ('taxiologists', 'Taxiologists', 'Mobile App + Dashboard', 'amber',
     'A taxi and fleet business running dispatch on phone calls and memory — rebuilt as a booking app with a real-time management dashboard.',
     JSON_ARRAY('React Native','Node.js','MySQL'),
     JSON_ARRAY(
        'Bookings came in over calls and messages, with no single record of who booked what.',
        'Dispatch depended on someone manually matching riders to available drivers.',
        'No live view of driver location, trip status, or daily operations.'),
     JSON_ARRAY(
        'A rider-facing mobile app for booking and trip tracking.',
        'A management dashboard for dispatch, driver assignment, and trip oversight.',
        'Real-time trip and driver status so operations can see everything at a glance.'),
     JSON_ARRAY(
        'Rider books a trip in the app',
        'Booking lands in the dispatch dashboard',
        'Operations assigns an available driver',
        'Driver and trip status update in real time',
        'Completed trips are logged for records and reporting'),
     JSON_ARRAY(
        'Dispatch moved from memory and phone calls to a single live system.',
        'Operations gained real-time visibility over drivers and trips.',
        'Booking history is now recorded and reviewable instead of lost in chat.'),
     'Napnix built our app and management dashboard end to end — bookings, driver tracking, and dispatch in real time. They stayed involved after launch.',
     'Parminder Singh', 'Owner, Taxiologists', 'published', 10),

    ('napcrm-manufacturing', 'NapCRM — Manufacturing', 'CRM Deployment', 'orange',
     'A manufacturing business tracking inventory, orders, and leads across scattered spreadsheets — consolidated onto a single multi-tenant NapCRM deployment.',
     JSON_ARRAY('React','Express','MariaDB'),
     JSON_ARRAY(
        'Inventory, orders, and leads lived in separate spreadsheets and inboxes.',
        'No shared, up-to-date view of the pipeline across the team.',
        'Manual handoffs meant enquiries and orders slipped through the cracks.'),
     JSON_ARRAY(
        'A dedicated NapCRM instance tailored for manufacturing operations.',
        'Inventory, order pipeline, and lead management in one connected system.',
        'Role-based access so the right people see the right data.'),
     JSON_ARRAY(
        'Lead or order enters the pipeline',
        'Inventory and order status stay linked and current',
        'Team works from one shared view',
        'Follow-ups and handoffs are tracked, not forgotten',
        'Dashboards show the state of the business at a glance'),
     JSON_ARRAY(
        'Replaced a pile of spreadsheets with a single source of truth.',
        'The whole team now works from the same live view of the business.',
        'Orders and leads are tracked end to end instead of scattered.'),
     'We run inventory, orders, and our lead pipeline on NapCRM now. It replaced a pile of spreadsheets and gave the whole team the same view of the business.',
     'Rahul Verma', 'Managing Director, Verma Industries', 'published', 20),

    ('napcrm-legal', 'NapCRM — Legal', 'CRM Deployment', 'indigo',
     'A legal practice with cases, clients, and documents spread across files and memory — moved onto NapCRM for reliable case and client management.',
     JSON_ARRAY('React','Express','MariaDB'),
     JSON_ARRAY(
        'Cases, client details, and documents were scattered and hard to track.',
        'Follow-ups depended on someone remembering, so things slipped.',
        'No single place to see the status of every matter and client.'),
     JSON_ARRAY(
        'A NapCRM deployment built around a legal practice''s workflow.',
        'Case and matter tracking, client records, and document workflows in one system.',
        'Clear ownership and follow-up so nothing falls through.'),
     JSON_ARRAY(
        'New client or matter is created in the system',
        'Case details, tasks, and documents stay linked',
        'Follow-ups and deadlines are tracked, not remembered',
        'Client records are always up to date',
        'The practice sees the status of every matter in one place'),
     JSON_ARRAY(
        'Cases, clients, and documents are organised in one reliable system.',
        'Follow-ups are tracked instead of depending on memory.',
        'The practice has clear visibility over every active matter.'),
     'As an advocate I need clean records and reliable follow-up. Cases, clients, and documents stay organised in one system, so nothing slips through.',
     'Aman Singh', 'Advocate, Aman Singh Legal', 'published', 30)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);
