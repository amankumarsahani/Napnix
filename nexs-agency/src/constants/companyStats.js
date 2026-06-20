/** Canonical company metrics — single source of truth sitewide. */
export const COMPANY_STATS = {
    projects: '10+',
    clients: '10+',
    successRate: '98%',
    support: '24/7',
};

export const SUPPORT_LABEL = '24/7 support for active client engagements';
export const ENQUIRY_RESPONSE_LABEL = 'Typical reply within 24 hours for new enquiries';

export const DEFAULT_CITY_STATS = [
    { label: 'Projects Delivered', value: COMPANY_STATS.projects },
    { label: 'Clients Served', value: COMPANY_STATS.clients },
    { label: 'Success Rate', value: COMPANY_STATS.successRate },
    { label: 'Support', value: COMPANY_STATS.support },
];
