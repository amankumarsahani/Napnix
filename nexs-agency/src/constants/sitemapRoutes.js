/** Static routes for sitemap generation. Dynamic blog slugs from API are not included.
 *
 * lastmod must reflect when a page's content actually changed. Stamping every
 * entry with the build date tells crawlers the whole site changed on every
 * deploy, which devalues the signal. Bump CONTENT_UPDATED when you ship a
 * content change, or give an individual entry its own lastmod.
 */
import { BLOG_POSTS } from './blogPosts.js';
import { ALTERNATIVE_SLUGS } from './alternatives.js';

const CONTENT_UPDATED = '2026-10-05';

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

/**
 * Derived from the post manifest so the sitemap, the blog index and the
 * articles themselves cannot drift apart. Each entry carries the post's own
 * revision date rather than the sitewide CONTENT_UPDATED stamp.
 */
export const BLOG_PATHS = BLOG_POSTS.map((post) => `/blog/${post.slug}`);

/** @returns {{ path: string, priority: string, changefreq: string }[]} */
export function getSitemapEntries() {
    const core = [
        { path: '/', priority: '1.0', changefreq: 'weekly' },
        { path: '/services', priority: '0.9', changefreq: 'weekly' },
        { path: '/about', priority: '0.8', changefreq: 'monthly' },
        { path: '/portfolio', priority: '0.8', changefreq: 'weekly' },
        { path: '/portfolio/taxiologists', priority: '0.7', changefreq: 'monthly' },
        { path: '/portfolio/napcrm-manufacturing', priority: '0.7', changefreq: 'monthly' },
        { path: '/portfolio/napcrm-legal', priority: '0.7', changefreq: 'monthly' },
        { path: '/audit', priority: '0.9', changefreq: 'monthly' },
        { path: '/contact', priority: '0.8', changefreq: 'monthly' },
        { path: '/blog', priority: '0.8', changefreq: 'daily' },
        { path: '/faq', priority: '0.8', changefreq: 'weekly' },
        { path: '/napcrm', priority: '0.9', changefreq: 'weekly' },
        { path: '/napcrm/pricing', priority: '0.9', changefreq: 'weekly' },
        { path: '/products', priority: '0.8', changefreq: 'weekly' },
        { path: '/napmail', priority: '0.9', changefreq: 'weekly' },
        { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
        { path: '/terms', priority: '0.4', changefreq: 'yearly' },
        { path: '/cookie-policy', priority: '0.3', changefreq: 'yearly' },
        { path: '/security', priority: '0.4', changefreq: 'yearly' },
    ];

    const cities = CITY_SLUGS.map((slug) => ({
        path: `/software-development-company/${slug}`,
        priority: slug === 'mohali' || slug === 'chandigarh' ? '0.95' : '0.9',
        changefreq: 'weekly',
    }));

    /* Commercial-intent comparison pages. High priority: these target the
       "<competitor> alternative" queries the SXO pass found had no
       ranking-eligible page type on the site at all. */
    const alternatives = ALTERNATIVE_SLUGS.map((slug) => ({
        path: `/alternatives/${slug}`,
        priority: '0.9',
        changefreq: 'monthly',
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

    const blogs = BLOG_POSTS.map((post) => ({
        path: `/blog/${post.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: post.updated,
    }));

    return [...core, ...cities, ...alternatives, ...industries, ...services, ...blogs].map((entry) => ({
        lastmod: CONTENT_UPDATED,
        ...entry,
    }));
}
