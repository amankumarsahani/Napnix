/**
 * Real project set — used as the offline fallback when the portfolio API is
 * unreachable, so the site is never empty. Keep in sync with the seed in
 * nexs-backend migration 054_create_portfolio.sql (admin panel is the source
 * of truth once the API is live).
 */
export const PORTFOLIO_FALLBACK = [
    {
        id: 1, title: 'Taxiologists', slug: 'taxiologists', category: 'Mobile App',
        accent: 'amber', size: 'large', metric: 'Live',
        description: 'Taxi and fleet booking app with a real-time management dashboard for dispatch, driver tracking, and trip operations.',
        tags: ['Mobile App', 'Dashboard', 'Real-time'],
        technologies: ['React Native', 'Node.js', 'MySQL'],
    },
    {
        id: 2, title: 'TeleSync', slug: 'telesync', category: 'Mobile App',
        accent: 'emerald', size: 'small', metric: 'Live',
        description: 'Android telecalling CRM that syncs call logs in the background and pushes activity to a live sales dashboard.',
        tags: ['Mobile App', 'CRM', 'Call Sync'],
        technologies: ['Native Android', 'Kotlin', 'REST API'],
    },
    {
        id: 3, title: 'CallStats', slug: 'callstats', category: 'Mobile App',
        accent: 'sky', size: 'small', metric: 'Live',
        description: 'Call analytics app that tracks agent call activity and surfaces performance metrics for telecalling teams.',
        tags: ['Mobile App', 'Analytics'],
        technologies: ['Native Android', 'Kotlin'],
    },
    {
        id: 4, title: 'Meet Master', slug: 'meet-master', category: 'Web Platform',
        accent: 'violet', size: 'wide', metric: 'Live',
        description: 'AI meeting recorder and summarizer with speaker labels and multi-provider AI summaries, delivered over your own SMTP.',
        tags: ['AI', 'Automation', 'Productivity'],
        technologies: ['Chrome Extension', 'Node.js', 'Multi-LLM'],
    },
    {
        id: 5, title: 'HR Management Dashboard', slug: 'hr-management-dashboard', category: 'Dashboard',
        accent: 'rose', size: 'small', metric: 'Live',
        description: 'Internal HR operations dashboard covering employees, attendance, and payroll with role-based access.',
        tags: ['Dashboard', 'HR', 'Operations'],
        technologies: ['React', 'Node.js', 'MySQL'],
    },
    {
        id: 6, title: 'NapCRM — Manufacturing', slug: 'napcrm-manufacturing', category: 'Web Platform',
        accent: 'orange', size: 'small', metric: 'Live',
        description: 'Multi-tenant CRM deployment for a manufacturing business: inventory, order pipeline, and lead management.',
        tags: ['CRM', 'SaaS', 'Manufacturing'],
        technologies: ['React', 'Express', 'MariaDB'],
    },
    {
        id: 7, title: 'NapCRM — Legal', slug: 'napcrm-legal', category: 'Web Platform',
        accent: 'indigo', size: 'small', metric: 'Live',
        description: 'CRM deployment for a legal firm: case and matter tracking, client records, and document workflows.',
        tags: ['CRM', 'SaaS', 'Legal'],
        technologies: ['React', 'Express', 'MariaDB'],
    },
];

export const ACCENT_GRADIENTS = {
    amber: 'from-amber-500 via-orange-600 to-rose-600',
    emerald: 'from-emerald-500 via-teal-600 to-cyan-700',
    sky: 'from-sky-500 via-blue-600 to-indigo-700',
    violet: 'from-violet-500 via-purple-600 to-fuchsia-700',
    rose: 'from-rose-500 via-pink-600 to-red-600',
    orange: 'from-orange-500 via-amber-600 to-yellow-600',
    indigo: 'from-indigo-500 via-blue-700 to-slate-800',
    default: 'from-slate-700 via-slate-800 to-slate-900',
};
