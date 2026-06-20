import { SITE_URL, siteConfig } from './siteConfig';

export const PRODUCT_IMAGE = `${SITE_URL}/og-image.jpg`;

export const NAPNIX_BRAND = {
    '@type': 'Brand',
    name: 'Napnix',
    alternateName: 'Napix',
};

const GLOBAL_COUNTRIES = ['IN', 'US', 'GB', 'AE', 'CA', 'AU'];

/** Instant digital delivery — satisfies Google Product offer shippingDetails. */
export const DIGITAL_SHIPPING_DETAILS = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'INR',
    },
    deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
        },
        transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY',
        },
    },
    shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: GLOBAL_COUNTRIES,
    },
};

/** 14-day free trial aligns with published NapCRM/NapMail policy. */
export const SAAS_RETURN_POLICY = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: GLOBAL_COUNTRIES,
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
};

export const FREE_SERVICE_RETURN_POLICY = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: GLOBAL_COUNTRIES,
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
};

export function enrichOffer(offer, { saas = true } = {}) {
    return {
        ...offer,
        shippingDetails: DIGITAL_SHIPPING_DETAILS,
        hasMerchantReturnPolicy: saas ? SAAS_RETURN_POLICY : FREE_SERVICE_RETURN_POLICY,
    };
}

export function buildSaasProduct({
    name,
    description,
    url,
    sku,
    priceINR,
    offerUrl,
}) {
    return {
        '@type': 'Product',
        name,
        description,
        image: PRODUCT_IMAGE,
        brand: NAPNIX_BRAND,
        sku,
        url,
        offers: enrichOffer({
            '@type': 'Offer',
            name,
            description,
            url: offerUrl || url,
            price: String(priceINR),
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
        }),
    };
}

export function buildSaasTierOffer(tier, pageUrl) {
    return enrichOffer({
        '@type': 'Offer',
        name: tier.name,
        description: tier.description,
        url: pageUrl,
        price: String(tier.price.monthly.INR),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
    });
}

export function buildAggregateSaasOffers(tiers, pageUrl, { excludeCustom = true } = {}) {
    const eligible = tiers.filter((tier) => {
        if (excludeCustom && tier.isCustom) return false;
        return tier.price?.monthly?.INR != null;
    });
    const prices = eligible.map((t) => t.price.monthly.INR);

    return {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: String(Math.min(...prices)),
        highPrice: String(Math.max(...prices)),
        offerCount: String(eligible.length),
        offers: eligible.map((tier) => buildSaasTierOffer(tier, pageUrl)),
    };
}

export function buildSoftwareApplicationSchema({
    name,
    description,
    url,
    sku,
    offers,
    operatingSystem = 'Web',
    extra = {},
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name,
        description,
        url,
        image: PRODUCT_IMAGE,
        applicationCategory: 'BusinessApplication',
        operatingSystem,
        brand: NAPNIX_BRAND,
        sku,
        offers,
        provider: {
            '@type': 'Organization',
            name: 'Napnix',
            url: SITE_URL,
            telephone: siteConfig.phone.primary,
            email: siteConfig.email.primary,
        },
        ...extra,
    };
}

export function slugifyProductName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
