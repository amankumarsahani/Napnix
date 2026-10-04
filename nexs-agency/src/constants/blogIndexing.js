/**
 * Which blog posts search engines should index.
 *
 * The blog carries 86 machine-generated posts whose slugs are a title
 * truncated to 50 characters plus an 8-character id, e.g.
 *   teaching-old-computers-new-tricks-how-artificial-i-mq7inncf
 *
 * Over the 90 days to 2026-10-05 those 86 posts drew 903 impressions — 41% of
 * the whole site — and produced 3 clicks, ranking for "ai with emotions",
 * "connectionism vs symbolism" and "india retail edge computing market". None
 * relate to CRM, lead follow-up or custom software, and none are in the
 * sitemap. They pull topical relevance away from the pages that sell.
 *
 * They stay reachable and keep passing link equity (noindex, follow); they
 * just stop competing for relevance. Rewrite one with a short, hand-written
 * slug to bring it back into the index.
 */

/** Hand-written slugs always stay indexable, whatever their shape. */
export const CURATED_BLOG_SLUGS = new Set([
    'ai-trends-2026',
    'react-native-vs-flutter',
    'cost-of-custom-crm-2026',
    'monolith-to-microservices',
    'why-business-needs-pwa',
]);

/** Trailing "-" + 8 lowercase alphanumerics, the generator's id suffix. */
const GENERATED_SUFFIX = /-[a-z0-9]{8}$/;

/**
 * A generated slug is a 50-character truncated title plus a 9-character
 * suffix. Both conditions must hold: the suffix alone would also match a
 * hand-written slug ending in an eight-letter word such as "-security".
 */
const GENERATED_MIN_LENGTH = 46;

export function isGeneratedSlug(slug) {
    if (!slug || CURATED_BLOG_SLUGS.has(slug)) return false;
    return slug.length >= GENERATED_MIN_LENGTH && GENERATED_SUFFIX.test(slug);
}

/** Value for the robots meta tag on a blog article. */
export function blogRobotsDirective(slug) {
    return isGeneratedSlug(slug)
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large, max-snippet:-1';
}
