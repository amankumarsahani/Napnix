import { SITE_URL, siteConfig } from './siteConfig';

export const PRODUCT_IMAGE = `${SITE_URL}/og-image.jpg`;

export const NAPNIX_BRAND = {
    '@type': 'Brand',
    name: 'Napnix',
    alternateName: 'Napix',
};

export const GLOBAL_COUNTRIES = ['IN', 'US', 'GB', 'AE', 'CA', 'AU'];

/**
 * Offers carry no return policy and no shipping details.
 *
 * What used to be here, on every NapCRM and service offer sitewide:
 *
 *   hasMerchantReturnPolicy: MerchantReturnFiniteReturnWindow,
 *                            merchantReturnDays: 14,
 *                            returnMethod: ReturnByMail,
 *                            returnFees: FreeReturn,
 *                            refundType: FullRefund
 *   shippingDetails:         OfferShippingDetails, ₹0, 0-1 day handling
 *
 * Three problems with that:
 *
 * 1. No such policy exists. The words "refund", "free trial", "14-day" and
 *    "money back" appear nowhere in the Terms, the pricing page, the FAQ or the
 *    NapCRM page. The only "refund" text on the site describes a NapCRM
 *    *feature* for e-commerce clients handling their own customers' returns.
 *    Structured data must describe content on the page; asserting a refund
 *    entitlement the business has not published is both a policy violation and
 *    a commitment a customer could reasonably try to enforce.
 * 2. ReturnByMail is meaningless for software. There is nothing to post back.
 * 3. Neither property is required here. These offers hang off
 *    SoftwareApplication and Service, not Product, so Google asks for
 *    shippingDetails and hasMerchantReturnPolicy on neither.
 *
 * Omitting a property asserts nothing, which is the accurate state. If a real
 * refund or trial policy is published, add it back here AND put it in visible
 * copy on the pricing page — the markup has to match what a reader can see.
 */
export function enrichOffer(offer) {
    return { ...offer };
}

/**
 * SaaS pricing plan for ItemList / offer markup.
 * Uses SoftwareApplication (not Product) — avoids Google Product snippet
 * requirements for aggregateRating/review on subscription software.
 */
export function buildSaasProduct({
    name,
    description,
    url,
    sku,
    priceINR,
    offerUrl,
    operatingSystem = 'Web, Android, iOS',
}) {
    return {
        '@type': 'SoftwareApplication',
        name,
        description,
        image: PRODUCT_IMAGE,
        applicationCategory: 'BusinessApplication',
        operatingSystem,
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
            telephone: siteConfig.phone.tel,
            email: siteConfig.email.primary,
        },
        ...extra,
    };
}

export function slugifyProductName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
