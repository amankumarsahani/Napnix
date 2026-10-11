/**
 * The published blog posts, for the build.
 *
 * Why the build can do this at all: `.env.production` points the app at
 * https://api.napnix.in/api, so the bundle that prerender.mjs drives in
 * headless Chromium already fetches articles from the live API. The comment at
 * the top of prerender.mjs saying API routes "render nearly empty because no
 * backend is running at build time" describes a local dev build; a production
 * build talks to the real API. Articles were skipped because they were never in
 * the route list, not because they could not render.
 *
 * Everything here degrades to an empty list. A build must not fail because the
 * API is slow or down: an empty list means no article routes are prerendered
 * and no article entries go in the sitemap, which is exactly today's behaviour.
 * nginx still serves every article from the SPA shell on a 200, so the site
 * stays correct -- it just loses the prerendered copy until the next build.
 */

import { isGeneratedSlug } from '../../src/constants/blogIndexing.js';

const API_BASE = process.env.BLOG_API_BASE || 'https://api.napnix.in/api';

/*
 * Articles from before this date are never prerendered and never enter the
 * sitemap, whatever their slug looks like.
 *
 * The generated back catalogue is removed by unpublish-ai-blogs.js, and an
 * unpublished post never reaches this code. But that leaves an ordering
 * dependency -- run a build before that script and the sitemap picks up posts
 * we are trying to retire. It is not hypothetical: the slug-shape rule in
 * blogIndexing.js cannot see
 * revolutionizing-industries-how-artificial-intelligence-is-tr, which is 60
 * characters but ends in -tr, so a build run today would submit it to Google.
 *
 * One date is a cheaper way to express "nothing from before the cutover" than
 * a list of slugs, and it holds no matter what order things run in.
 */
const BLOG_CUTOVER = Date.parse(process.env.BLOG_CUTOVER || '2026-10-11T00:00:00Z');
const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const TIMEOUT_MS = 20000;

async function fetchPage(page) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(
            `${API_BASE}/blogs?limit=${PAGE_SIZE}&page=${page}`,
            { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Every published post, newest first.
 * @returns {Promise<{slug: string, createdAt: string|null, updatedAt: string|null}[]>}
 */
export async function fetchPublishedBlogs() {
    const posts = [];
    try {
        for (let page = 1; page <= MAX_PAGES; page++) {
            const body = await fetchPage(page);
            const blogs = body.blogs || [];
            for (const blog of blogs) {
                if (!blog.slug) continue;
                posts.push({
                    slug: blog.slug,
                    createdAt: blog.created_at || null,
                    updatedAt: (blog.updated_at || blog.created_at || '').slice(0, 10) || null,
                });
            }
            if (blogs.length === 0 || posts.length >= (body.pagination?.total || 0)) break;
        }
    } catch (error) {
        console.warn(`publishedBlogs: could not read ${API_BASE} (${error.message}) -- continuing with none`);
        return [];
    }
    return posts;
}

/**
 * The published posts that are allowed in the index.
 *
 * This is the set worth prerendering and worth putting in the sitemap. The 243
 * legacy posts are deliberately excluded from both: they are served
 * `noindex, follow`, so a prerendered copy would spend build time making
 * off-topic content legible to the AI crawlers robots.txt invites, and a
 * sitemap entry would ask Google to crawl what we are telling it to ignore.
 *
 * Today that leaves one post. It grows by one per genuinely new article, so the
 * added build time stays proportional to content that earns it.
 */
export async function fetchIndexableBlogs() {
    const posts = await fetchPublishedBlogs();
    return posts.filter(
        (post) =>
            !isGeneratedSlug(post.slug) &&
            post.createdAt !== null &&
            Date.parse(post.createdAt) >= BLOG_CUTOVER,
    );
}
