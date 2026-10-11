/**
 * Which blog posts search engines should index.
 *
 * The primary mechanism is no longer this file. The ~240 generated posts are
 * unpublished by nexs-backend/scripts/unpublish-ai-blogs.js, which sets
 * status = 'draft'. A draft drops out of the API, so the article route 404s and
 * BlogArticle renders its not-found branch with `noindex` -- see the soft-404
 * comment there. Nothing is deleted; that script prints the ids to undo it.
 *
 * Why unpublish rather than index-hide: over the 90 days to 2026-10-05 those
 * posts drew 903 impressions for queries like "ai with emotions" and
 * "connectionism vs symbolism" and produced 3 clicks, while holding about 61%
 * of all site impressions. Hiding them from the index leaves 240 thin pages on
 * the domain; unpublishing removes them. The argument for keeping them -- that
 * they still pass link equity -- does not hold here, because the audit found
 * napnix.in absent from Common Crawl's web graph entirely, so there is
 * essentially no inbound equity to preserve.
 *
 * What remains below is a safety net, not the rule. It covers a generated post
 * that is still published: one the unpublish script skipped, or one created by
 * an older build before the slug cap landed. It costs nothing and fails safe.
 *
 * The coupling worth knowing about: the slug builder in
 * nexs-backend/services/aiBlog.service.js caps slugs at 45 characters
 * specifically so its output stays below GENERATED_MIN_LENGTH and can never be
 * caught by the pattern here. Move one and you must move the other. The nginx
 * $blog_legacy_robots map in deploy/nginx-napnix.conf applies the same rule at
 * the HTTP layer, for the crawlers that do not run JavaScript.
 */

/** Hand-written slugs always stay indexable, whatever their shape. */
export const CURATED_BLOG_SLUGS = new Set([
    'ai-trends-2026',
    'whatsapp-lead-follow-up',
    'react-native-vs-flutter',
    'cost-of-custom-crm-2026',
    'monolith-to-microservices',
    'why-business-needs-pwa',
]);

/** Trailing "-" + 8 lowercase alphanumerics, the retired generator's id suffix. */
const GENERATED_SUFFIX = /-[a-z0-9]{8}$/;

/**
 * Both conditions must hold. The suffix alone would also match a hand-written
 * slug ending in an eight-letter word such as "-security", and the current
 * slug cap of 45 sits below this floor so new output cannot match.
 */
const GENERATED_MIN_LENGTH = 46;

/** True when a post should be kept out of the index. */
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
