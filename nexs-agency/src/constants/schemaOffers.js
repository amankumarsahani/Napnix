import { SITE_URL } from './siteConfig';
import { enrichOffer, FREE_SERVICE_RETURN_POLICY, DIGITAL_SHIPPING_DETAILS } from './productSchema';

/** Satisfies Google LocalBusiness / ProfessionalService rich-result requirement. */
export const napnixConsultationOffer = enrichOffer({
    '@type': 'Offer',
    name: 'Free Software Consultation',
    description: 'Free discovery call for custom software, web, mobile, CRM, and AI projects.',
    url: `${SITE_URL}/contact`,
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
}, { saas: false });

export const napnixServiceOffers = [
    napnixConsultationOffer,
    enrichOffer({
        '@type': 'Offer',
        name: 'Custom Web Development',
        description: 'Full-stack web application development with React, Next.js, and Node.js.',
        itemOffered: {
            '@type': 'Service',
            name: 'Custom Web Development',
            url: `${SITE_URL}/services/custom-web-development`,
        },
        url: `${SITE_URL}/contact`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
    }, { saas: false }),
    enrichOffer({
        '@type': 'Offer',
        name: 'Mobile App Development',
        description: 'iOS, Android, and cross-platform apps with Flutter and React Native.',
        itemOffered: {
            '@type': 'Service',
            name: 'Mobile App Development',
            url: `${SITE_URL}/services/mobile-app-development`,
        },
        url: `${SITE_URL}/contact`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
    }, { saas: false }),
    enrichOffer({
        '@type': 'Offer',
        name: 'AI & Machine Learning',
        description: 'Custom AI models, NLP, computer vision, and ML pipeline development.',
        itemOffered: {
            '@type': 'Service',
            name: 'AI & Machine Learning',
            url: `${SITE_URL}/services/ai-machine-learning`,
        },
        url: `${SITE_URL}/contact`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
    }, { saas: false }),
];

export function getLocalBusinessOffers(pageUrl = `${SITE_URL}/contact`) {
    return [
        {
            ...napnixConsultationOffer,
            url: pageUrl,
        },
    ];
}

/** Static JSON fragments for index.html (mirrors enrichOffer fields). */
export const staticConsultationOfferJson = {
    '@type': 'Offer',
    name: 'Free Software Consultation',
    description: 'Free discovery call for custom software, web, mobile, CRM, and AI projects.',
    url: 'https://napnix.in/contact',
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    shippingDetails: DIGITAL_SHIPPING_DETAILS,
    hasMerchantReturnPolicy: FREE_SERVICE_RETURN_POLICY,
};

export function staticServiceOfferJson(name, serviceUrl) {
    return {
        '@type': 'Offer',
        name,
        description: `${name} — request a project quote from Napnix.`,
        itemOffered: {
            '@type': 'Service',
            name,
            url: serviceUrl,
        },
        url: 'https://napnix.in/contact',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        shippingDetails: DIGITAL_SHIPPING_DETAILS,
        hasMerchantReturnPolicy: FREE_SERVICE_RETURN_POLICY,
    };
}
