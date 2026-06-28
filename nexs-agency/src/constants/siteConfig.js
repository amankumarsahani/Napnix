export const SITE_URL = 'https://napnix.in';

export const LOGO_PATH = '/assets/logos/Napnix_v2_h_l_nobg.png';
export const LOGO_DARK_PATH = '/assets/logos/Napnix_v2_h_d_nobg.png';
export const FAVICON_PATH = '/assets/logos/Napnix_v2_logo_nobg.png';
export const LOGO_URL = `${SITE_URL}${LOGO_PATH}`;

export const siteConfig = {
    logo: LOGO_PATH,
    logoDark: LOGO_DARK_PATH,
    favicon: FAVICON_PATH,
    logoAlt: 'Napnix logo',
    brandName: 'Napnix',
    brandAlias: 'Napix',
    email: {
        primary: 'info@napnix.in',
        info: 'info@napnix.in',
        sales: 'sales@napnix.in',
        support: 'support@napnix.in',
        admin: 'admin@napnix.in',
        noreply: 'noreply@napnix.in',
    },
    phone: {
        primary: '+91 6239396615',
        secondary: '+91 7009108646',
        tel: '+916239396615',
    },
    domain: SITE_URL,
    social: [
        { icon: 'ri-github-line', iconFill: 'ri-github-fill', href: 'https://github.com/orgs/Napnix-Solutions/repositories', label: 'GitHub' },
        { icon: 'ri-linkedin-line', iconFill: 'ri-linkedin-fill', href: 'https://www.linkedin.com/company/napnix', label: 'LinkedIn' },
        { icon: 'ri-instagram-line', iconFill: 'ri-instagram-fill', href: 'https://www.instagram.com/napnixofficial/', label: 'Instagram' },
    ],
    socialUrls: [
        'https://github.com/orgs/Napnix-Solutions/repositories',
        'https://www.linkedin.com/company/napnix',
        'https://www.instagram.com/napnixofficial/',
    ],
};
