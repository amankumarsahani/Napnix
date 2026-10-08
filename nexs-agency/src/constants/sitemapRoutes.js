/** Static routes for sitemap generation. Dynamic blog slugs from API are not included.
 *
 * lastmod must reflect when a page's content actually changed. Stamping every
 * entry with the build date tells crawlers the whole site changed on every
 * deploy, which devalues the signal. Bump CONTENT_UPDATED when you ship a
 * content change, or give an individual entry its own lastmod.
 */
import { BLOG_POSTS } from './blogPosts.js';
import { ALTERNATIVE_SLUGS } from './alternatives.js';
import { AUTHORS } from './authors.js';

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

/**
 * Which city pages search engines should index.
 *
 * Only the two we can actually claim. Napnix has one office, in Balongi
 * (Mohali), and Chandigarh is the adjacent Tricity market — a local claim that
 * holds up. There is no office in London, New York, Bangalore, Dubai, Sydney or
 * Toronto, and 90 days of Search Console data shows what those six pages
 * actually earned: zero clicks, and impressions almost entirely for queries we
 * cannot legitimately serve. The Bangalore page's top terms were
 * "mobile app development in jp nagar" (15 impressions, position 86.6),
 * "software development company in btm layout" (position 60.5) — hyper-local
 * Bangalore neighbourhood searches — plus brand confusion with
 * "cloudnix software labs private limited" (11 impressions) and
 * "naptico services pvt ltd".
 *
 * Six templated 330-380 word pages competing on a local claim we do not have is
 * the doorway-page pattern, and it risks the whole site under the
 * helpful-content system for traffic that was never going to convert. They stay
 * reachable on `noindex, follow` so existing links keep their equity, and they
 * leave the sitemap: asking Google to crawl a page we are telling it not to
 * index is a contradiction.
 *
 * The honest replacement is one global-delivery page describing remote
 * engineering from India. Removing these six is the reversible first step.
 */
export const INDEXABLE_CITY_SLUGS = ['mohali', 'chandigarh'];

export const isCityIndexable = (slug) => INDEXABLE_CITY_SLUGS.includes(slug);

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
    '/services/crm-development',
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
        /* Free tool, built to be linked to rather than to rank. */
        { path: '/tools/crm-cost-calculator', priority: '0.8', changefreq: 'monthly' },
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

    /* Only the indexable cities. See INDEXABLE_CITY_SLUGS above for why the six
       overseas pages are excluded -- a sitemap entry for a noindex page asks
       Google to crawl what we are telling it to ignore. */
    const cities = INDEXABLE_CITY_SLUGS.map((slug) => ({
        path: `/software-development-company/${slug}`,
        priority: '0.95',
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

    /* One page per named author. Lower priority than commercial pages — these
       exist to give Person.url an entity to resolve to, not to rank. */
    const authors = Object.keys(AUTHORS).map((id) => ({
        path: `/authors/${id}`,
        priority: '0.5',
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

    return [...core, ...cities, ...alternatives, ...authors, ...industries, ...services, ...blogs].map((entry) => ({
        lastmod: CONTENT_UPDATED,
        ...entry,
    }));
}

/**
 * Routes the build must render to static HTML.
 *
 * This is deliberately NOT the sitemap set. A page can be noindex and still
 * need to exist: the six overseas city pages are excluded from the sitemap (see
 * INDEXABLE_CITY_SLUGS) but are still live URLs with inbound links, and nginx
 * serves this directory tree with `try_files $uri $uri/index.html =404`. Drive
 * prerender from the sitemap alone and those six stop being written, so every
 * one of them starts returning 404 -- which is what happened the first time
 * this split was made.
 *
 * Rule of thumb: the sitemap answers "what should Google index?", this answers
 * "what must the server be able to serve?". The second is always a superset.
 */
export function getPrerenderRoutes() {
    const indexable = getSitemapEntries().map((e) => e.path);
    const noindexCities = CITY_SLUGS
        .filter((slug) => !isCityIndexable(slug))
        .map((slug) => `/software-development-company/${slug}`);
    return [...indexable, ...noindexCities];
}
