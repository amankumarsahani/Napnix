/**
 * Full case-study content, keyed by portfolio slug. Only projects with a
 * case study here get a /portfolio/:slug detail page; others link to /portfolio.
 * Outcomes are qualitative and honest — no fabricated metrics.
 */
export const CASE_STUDIES = {
    'taxiologists': {
        slug: 'taxiologists',
        title: 'Taxiologists',
        category: 'Mobile App + Dashboard',
        accent: 'amber',
        summary: 'A taxi and fleet business running dispatch on phone calls and memory — rebuilt as a booking app with a real-time management dashboard.',
        tech: ['React Native', 'Node.js', 'MySQL'],
        problem: [
            'Bookings came in over calls and messages, with no single record of who booked what.',
            'Dispatch depended on someone manually matching riders to available drivers.',
            'No live view of driver location, trip status, or daily operations.',
        ],
        solution: [
            'A rider-facing mobile app for booking and trip tracking.',
            'A management dashboard for dispatch, driver assignment, and trip oversight.',
            'Real-time trip and driver status so operations can see everything at a glance.',
        ],
        systemFlow: [
            'Rider books a trip in the app',
            'Booking lands in the dispatch dashboard',
            'Operations assigns an available driver',
            'Driver and trip status update in real time',
            'Completed trips are logged for records and reporting',
        ],
        impact: [
            'Dispatch moved from memory and phone calls to a single live system.',
            'Operations gained real-time visibility over drivers and trips.',
            'Booking history is now recorded and reviewable instead of lost in chat.',
        ],
        quote: {
            text: 'Napnix built our app and management dashboard end to end — bookings, driver tracking, and dispatch in real time. They stayed involved after launch.',
            author: 'Parminder Singh',
            role: 'Owner, Taxiologists',
        },
    },

    'napcrm-manufacturing': {
        slug: 'napcrm-manufacturing',
        title: 'NapCRM — Manufacturing',
        category: 'CRM Deployment',
        accent: 'orange',
        summary: 'A manufacturing business tracking inventory, orders, and leads across scattered spreadsheets — consolidated onto a single multi-tenant NapCRM deployment.',
        tech: ['React', 'Express', 'MariaDB'],
        problem: [
            'Inventory, orders, and leads lived in separate spreadsheets and inboxes.',
            'No shared, up-to-date view of the pipeline across the team.',
            'Manual handoffs meant enquiries and orders slipped through the cracks.',
        ],
        solution: [
            'A dedicated NapCRM instance tailored for manufacturing operations.',
            'Inventory, order pipeline, and lead management in one connected system.',
            'Role-based access so the right people see the right data.',
        ],
        systemFlow: [
            'Lead or order enters the pipeline',
            'Inventory and order status stay linked and current',
            'Team works from one shared view',
            'Follow-ups and handoffs are tracked, not forgotten',
            'Dashboards show the state of the business at a glance',
        ],
        impact: [
            'Replaced a pile of spreadsheets with a single source of truth.',
            'The whole team now works from the same live view of the business.',
            'Orders and leads are tracked end to end instead of scattered.',
        ],
        quote: {
            text: 'We run inventory, orders, and our lead pipeline on NapCRM now. It replaced a pile of spreadsheets and gave the whole team the same view of the business.',
            author: 'Rahul Verma',
            role: 'Managing Director, Verma Industries',
        },
    },

    'napcrm-legal': {
        slug: 'napcrm-legal',
        title: 'NapCRM — Legal',
        category: 'CRM Deployment',
        accent: 'indigo',
        summary: 'A legal practice with cases, clients, and documents spread across files and memory — moved onto NapCRM for reliable case and client management.',
        tech: ['React', 'Express', 'MariaDB'],
        problem: [
            'Cases, client details, and documents were scattered and hard to track.',
            'Follow-ups depended on someone remembering, so things slipped.',
            'No single place to see the status of every matter and client.',
        ],
        solution: [
            'A NapCRM deployment built around a legal practice\'s workflow.',
            'Case and matter tracking, client records, and document workflows in one system.',
            'Clear ownership and follow-up so nothing falls through.',
        ],
        systemFlow: [
            'New client or matter is created in the system',
            'Case details, tasks, and documents stay linked',
            'Follow-ups and deadlines are tracked, not remembered',
            'Client records are always up to date',
            'The practice sees the status of every matter in one place',
        ],
        impact: [
            'Cases, clients, and documents are organised in one reliable system.',
            'Follow-ups are tracked instead of depending on memory.',
            'The practice has clear visibility over every active matter.',
        ],
        quote: {
            text: 'As an advocate I need clean records and reliable follow-up. Cases, clients, and documents stay organised in one system, so nothing slips through.',
            author: 'Aman Singh',
            role: 'Advocate, Aman Singh Legal',
        },
    },
};

export const CASE_STUDY_SLUGS = Object.keys(CASE_STUDIES);
