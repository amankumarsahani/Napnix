/** Static routes for sitemap generation. Dynamic blog slugs from API are not included. */

export const CITY_SLUGS = [
    'mohali',
    'chandigarh',
    'london',
    'new-york',
    'bangalore',
    'dubai',
    'sydney',
    'toronto',
];

export const INDUSTRY_SLUGS = [
    'general',
    'ecommerce',
    'realestate',
    'services',
    'education',
    'healthcare',
    'hospitality',
    'travel',
    'fitness',
    'legal',
    'manufacturing',
    'logistics',
    'restaurant',
    'salon',
];

export const SERVICE_PATHS = [
    '/services/custom-web-development',
    '/services/mobile-app-development',
    '/services/ai-machine-learning',
    '/services/cloud-solutions',
    '/services/ecommerce-development',
];

export const BLOG_PATHS = [
    '/blog/ai-trends-2026',
    '/blog/react-native-vs-flutter',
    '/blog/cost-of-custom-crm-2026',
    '/blog/monolith-to-microservices',
    '/blog/why-business-needs-pwa',
];

export const PORTFOLIO_PATHS = [
    '/portfolio/ecommerce-platform',
    '/portfolio/food-delivery-app',
    '/portfolio/healthcare-dashboard',
    '/portfolio/real-estate-portal',
    '/portfolio/fitness-tracker',
    '/portfolio/inventory-management',
];

/** @returns {{ path: string, priority: string, changefreq: string }[]} */
export function getSitemapEntries() {
    const today = new Date().toISOString().slice(0, 10);

    const core = [
        { path: '/', priority: '1.0', changefreq: 'weekly' },
        { path: '/services', priority: '0.9', changefreq: 'weekly' },
        { path: '/about', priority: '0.8', changefreq: 'monthly' },
        { path: '/portfolio', priority: '0.9', changefreq: 'weekly' },
        { path: '/contact', priority: '0.8', changefreq: 'monthly' },
        { path: '/blog', priority: '0.8', changefreq: 'daily' },
        { path: '/faq', priority: '0.8', changefreq: 'weekly' },
        { path: '/napcrm', priority: '0.9', changefreq: 'weekly' },
        { path: '/napcrm/pricing', priority: '0.9', changefreq: 'weekly' },
        { path: '/napmail', priority: '0.9', changefreq: 'weekly' },
        { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
        { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    ];

    const cities = CITY_SLUGS.map((slug) => ({
        path: `/software-development-company/${slug}`,
        priority: slug === 'mohali' || slug === 'chandigarh' ? '0.95' : '0.9',
        changefreq: 'weekly',
    }));

    const industries = INDUSTRY_SLUGS.map((slug) => ({
        path: `/napcrm/industries/${slug}`,
        priority: '0.8',
        changefreq: 'monthly',
    }));

    const services = SERVICE_PATHS.map((path) => ({
        path,
        priority: '1.0',
        changefreq: 'weekly',
    }));

    const blogs = BLOG_PATHS.map((path) => ({
        path,
        priority: '0.8',
        changefreq: 'monthly',
    }));

    const portfolio = PORTFOLIO_PATHS.map((path) => ({
        path,
        priority: '0.7',
        changefreq: 'monthly',
    }));

    return [...core, ...cities, ...industries, ...services, ...blogs, ...portfolio].map((entry) => ({
        ...entry,
        lastmod: today,
    }));
}
