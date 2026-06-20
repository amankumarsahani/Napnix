import { SITE_URL, siteConfig, LOGO_URL } from './siteConfig';

export const BRAND_NAME = 'Napnix';
export const BRAND_ALIAS = 'Napix';

/** Brand + common search spellings for meta keywords. */
export const BRAND_KEYWORDS = 'napnix, napix, napnix.in, napix software, napnix software company';

export const DEFAULT_SITE_KEYWORDS = [
    BRAND_KEYWORDS,
    'custom software development company',
    'web development agency',
    'mobile app development',
    'CRM development',
    'AI software company',
    'software company Mohali',
    'software company India',
].join(', ');

/** Append napnix/napix to page-specific keywords without duplication. */
export function withBrandKeywords(keywords = '') {
    const parts = new Set(
        `${keywords}, ${BRAND_KEYWORDS}`
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
    );
    return [...parts].join(', ');
}

export function organizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        alternateName: [BRAND_ALIAS, 'Napnix Solutions'],
        url: SITE_URL,
        logo: LOGO_URL,
        email: siteConfig.email.primary,
        telephone: siteConfig.phone.tel,
        foundingDate: '2023',
        description:
            'Napnix is a software development company building custom web apps, mobile apps, CRM systems, AI workflows, and cloud platforms.',
        sameAs: siteConfig.socialUrls,
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'IT Park, Sector 67',
            addressLocality: 'Mohali',
            addressRegion: 'Punjab',
            postalCode: '160062',
            addressCountry: 'IN',
        },
    };
}

export function websiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND_NAME,
        alternateName: BRAND_ALIAS,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en',
    };
}
