/**
 * Canonical company metrics — single source of truth sitewide.
 *
 * Every figure here must be one someone could check, with its basis stated.
 * Unattributed hero numbers are a weak citability signal: an answer engine
 * quotes specific, sourced claims and skips bare percentages. Two figures that
 * used to live here were not just unsourced but self-contradicting, and both
 * are noted below.
 */

/**
 * Founded in 2025, which is also what Organization.foundingDate and llms.txt
 * state. A "5+ Years Experience" tile therefore contradicted the site's own
 * structured data, so the figure is now derived and cannot drift again.
 */
export const FOUNDED_YEAR = 2025;

function yearsActive() {
    const years = new Date().getUTCFullYear() - FOUNDED_YEAR;
    return years < 1 ? '<1' : `${years}+`;
}

export const COMPANY_STATS = {
    projects: '10+',
    clients: '10+',
    support: '24/7',
    countries: '4',
    years: yearsActive(),
    /**
     * NapCRM industry editions. Verifiable: it is the length of INDUSTRY_SLUGS
     * in sitemapRoutes.js, and each one has a live page.
     */
    industries: '14',
};

/**
 * REMOVED: `successRate: '98%'`.
 *
 * It was rendered as a bare "98% Success Rate" tile on the homepage, the
 * portfolio, the services page and all eight city pages, with no definition of
 * what counted as success and no basis given. It also could not be arithmetic
 * on `projects: '10+'` — with ten projects the only achievable rates are 90% or
 * 100%, so the number could not have come from the stated sample.
 *
 * To put a delivery-quality figure back on the site, add it here with the
 * metric defined and the period stated, e.g.
 *   onTimeDelivery: { value: '96%', basis: '24 of 25 projects delivered to the
 *   agreed scope and date, Jan 2025 - Sep 2026' }
 * and render the basis alongside the number.
 */

export const SUPPORT_LABEL = '24/7 support for active client engagements';
export const ENQUIRY_RESPONSE_LABEL = 'Typical reply within 24 hours for new enquiries';

export const DEFAULT_CITY_STATS = [
    { label: 'Projects Delivered', value: COMPANY_STATS.projects },
    { label: 'Clients Served', value: COMPANY_STATS.clients },
    { label: 'Industry CRM Editions', value: COMPANY_STATS.industries },
    { label: 'Support', value: COMPANY_STATS.support },
];
