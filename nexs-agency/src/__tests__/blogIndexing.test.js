import { describe, it, expect } from 'vitest';
import {
  CURATED_BLOG_SLUGS,
  isGeneratedSlug,
  blogRobotsDirective,
} from '../constants/blogIndexing';

/**
 * These tests guard a coupling that spans three files and two repositories, so
 * a change in any one of them breaks here rather than in production:
 *
 *   - src/constants/blogIndexing.js      the robots meta tag (this module)
 *   - deploy/nginx-napnix.conf           the $blog_legacy_robots map
 *   - nexs-backend/services/aiBlog.service.js   MAX_SLUG_LENGTH = 45
 *
 * The generator caps its slugs at 45 characters precisely so they stay under
 * GENERATED_MIN_LENGTH (46) and can never be classified as legacy. That is the
 * only thing stopping a well-formed slug such as
 * `how-manufacturers-use-whatsapp-for-dispatch` -- which also ends in eight
 * alphanumerics -- from being served noindex. If the ceiling and the floor stop
 * agreeing, the pipeline silently goes back to hiding its own output.
 */

/** The shape the retired slug builder produced: title + `Date.now().toString(36)`. */
const LEGACY_SLUGS = [
  'teaching-old-computers-new-tricks-how-artificial-i-mq7inncf',
  'why-connectionism-beat-symbolism-and-what-that-mean-mq8a1b2c',
  'india-retail-edge-computing-market-by-the-numbers-x-mq9zzzz1',
];

/** What the fixed generator emits: word-boundary cut, at most 45 characters. */
const GENERATED_SLUGS = [
  'teaching-old-computers-new-tricks-how',
  'indias-retail-edge-computing-market-by-the',
  'how-indian-manufacturers-use-whatsapp-2',
  'connectionism-vs-symbolism',
];

describe('isGeneratedSlug', () => {
  it('classifies the retired builder output as generated', () => {
    for (const slug of LEGACY_SLUGS) {
      expect(isGeneratedSlug(slug), slug).toBe(true);
    }
  });

  it('never classifies a curated post as generated', () => {
    for (const slug of CURATED_BLOG_SLUGS) {
      expect(isGeneratedSlug(slug), slug).toBe(false);
    }
  });

  it('leaves the fixed generator output indexable', () => {
    for (const slug of GENERATED_SLUGS) {
      expect(isGeneratedSlug(slug), slug).toBe(false);
    }
  });

  it('keeps a 45-character slug ending in eight alphanumerics indexable', () => {
    // The worst case the builder can produce, and the reason its 45-character
    // cap has to stay below GENERATED_MIN_LENGTH. At the old 70-character cap
    // this slug, and others like it, were silently noindexed.
    const slug = 'how-manufacturers-use-whatsapp-for-dispatch';
    expect(slug.length).toBeLessThan(46);
    expect(/-[a-z0-9]{8}$/.test(slug)).toBe(true);
    expect(isGeneratedSlug(slug)).toBe(false);
  });

  it('handles empty and missing input', () => {
    expect(isGeneratedSlug('')).toBe(false);
    expect(isGeneratedSlug(undefined)).toBe(false);
    expect(isGeneratedSlug(null)).toBe(false);
  });
});

describe('blogRobotsDirective', () => {
  it('noindexes legacy posts but keeps them followable', () => {
    expect(blogRobotsDirective(LEGACY_SLUGS[0])).toBe('noindex, follow');
  });

  it('fully indexes curated and newly generated posts', () => {
    const expected = 'index, follow, max-image-preview:large, max-snippet:-1';
    expect(blogRobotsDirective('ai-trends-2026')).toBe(expected);
    expect(blogRobotsDirective(GENERATED_SLUGS[0])).toBe(expected);
  });
});

describe('the nginx $blog_legacy_robots map agrees with this module', () => {
  // Mirror of the regex in deploy/nginx-napnix.conf. 37 characters, a hyphen,
  // then exactly eight -- 46 minimum, matching GENERATED_MIN_LENGTH.
  const NGINX_LEGACY = /^\/blog\/[a-z0-9-]{37,}-[a-z0-9]{8}\/?$/;
  const nginxSaysLegacy = (slug) => NGINX_LEGACY.test(`/blog/${slug}`);

  // nginx cannot read legacyBlogSlugs.js, so it implements rule 3 only, plus
  // named exceptions. The contract is therefore with hasGeneratedSlugShape --
  // comparing against isGeneratedSlug would fail by design the moment the
  // explicit list catches something the shape does not.
  it('reaches the same verdict as the shape rule for every slug under test', () => {
    for (const slug of [...LEGACY_SLUGS, ...GENERATED_SLUGS, ...CURATED_BLOG_SLUGS]) {
      expect(nginxSaysLegacy(slug), slug).toBe(isGeneratedSlug(slug));
    }
  });

});

describe('formatReadTime', () => {
  it('normalises both shapes the column has held', async () => {
    const { formatReadTime } = await import('../constants/blogPosts.js');
    expect(formatReadTime('7 min read')).toBe('7 min read');
    expect(formatReadTime(5)).toBe('5 min read');
    expect(formatReadTime('5')).toBe('5 min read');
    expect(formatReadTime(null)).toBe('5 min read');
    expect(formatReadTime('')).toBe('5 min read');
    expect(formatReadTime('nonsense')).toBe('5 min read');
  });
});
