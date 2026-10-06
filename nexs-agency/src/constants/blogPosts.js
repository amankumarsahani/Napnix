/**
 * The hand-written blog posts, as one source of truth.
 *
 * Three problems this replaces:
 *
 * 1. Each article component hard-coded its own title, date, byline and schema.
 *    All five showed a March 2024 date while three carried "2026" in the title,
 *    so the page contradicted itself: a reader and a crawler both saw a 2026
 *    guide written 19 months earlier. Content under ~3 months old is markedly
 *    more likely to be cited by AI answer engines, and a visibly stale date on
 *    a forward-looking title costs trust on top of that.
 *
 * 2. Nothing linked to these five posts. The blog index is API-driven and the
 *    homepage pointed at three slugs that were never built, so the only route
 *    in was the sitemap. BlogPage and the homepage now both render this list.
 *
 * 3. `published` is the date the article first went live and never changes.
 *    `updated` is the date its body was last genuinely revised — it is not a
 *    build timestamp and must not be touched unless the prose changed. Bumping
 *    it without editing the content is the "fake freshness" pattern Google's
 *    AI-optimization guidance calls out, and it is the one thing in this file
 *    that is easy to get wrong.
 */

export const BLOG_POSTS = [
    {
        slug: 'whatsapp-lead-follow-up',
        title: 'WhatsApp Lead Follow-Up That Actually Converts',
        excerpt:
            'Most "we need more leads" problems are follow-up problems. A first-week sequence, what WhatsApp conversation pricing costs, and the three numbers to measure.',
        category: 'Lead Management',
        tags: ['Lead follow-up', 'WhatsApp Business API', 'CRM automation', 'Service businesses'],
        authorId: 'aman-kumar',
        published: '2026-10-05',
        updated: '2026-10-05',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&h=630&fit=crop&q=75&fm=webp',
        imageAlt: 'A phone showing a messaging conversation beside a notebook of enquiries',
    },
    {
        slug: 'ai-trends-2026',
        title: 'Top 10 AI Trends Shaping Global Business in 2026',
        excerpt:
            'Agentic AI moved from demo to production in 2026. Here are the ten shifts actually changing how enterprises build software, and what each one costs to adopt.',
        category: 'Artificial Intelligence',
        tags: ['Agentic AI', 'LLMs', 'AI governance', 'EU AI Act'],
        authorId: 'aman-kumar',
        published: '2024-03-15',
        updated: '2026-10-05',
        readTime: '9 min read',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop&q=75&fm=webp',
        imageAlt: 'Abstract visualisation of a neural network, representing enterprise AI systems',
    },
    {
        slug: 'cost-of-custom-crm-2026',
        title: 'Cost of Building a Custom CRM in 2026: A Complete Guide',
        excerpt:
            'A custom CRM runs $30,000 to $250,000+ by scope. The breakdown by tier, the hidden running costs, and the point where buying beats building.',
        category: 'Enterprise Software',
        tags: ['CRM', 'Build vs buy', 'Budgeting', 'Integrations'],
        authorId: 'aman-kumar',
        published: '2024-03-20',
        updated: '2026-10-05',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=1200&h=630&fit=crop&q=75&fm=webp',
        imageAlt: 'A custom CRM dashboard showing a sales pipeline and reporting widgets',
    },
    {
        slug: 'react-native-vs-flutter',
        title: 'React Native vs. Flutter in 2026: A Decision Guide',
        excerpt:
            'Both ship one codebase to iOS and Android. The real difference is hiring, rendering model and maintenance, compared with a recommendation.',
        category: 'Mobile Development',
        tags: ['React Native', 'Flutter', 'iOS', 'Android'],
        authorId: 'anu-kumar',
        published: '2024-03-12',
        updated: '2026-10-05',
        readTime: '9 min read',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop&q=75&fm=webp',
        imageAlt: 'Two smartphones side by side running the same application interface',
    },
    {
        slug: 'monolith-to-microservices',
        title: 'Monolith to Microservices: A Step-by-Step Migration Guide',
        excerpt:
            'Decomposing a monolith without a rewrite. The strangler-fig sequence we use, in order, with the failure mode that kills most migrations at step four.',
        category: 'Architecture',
        tags: ['Microservices', 'Strangler fig', 'Architecture', 'Cloud'],
        authorId: 'aman-kumar',
        published: '2024-03-25',
        updated: '2026-10-05',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&q=75&fm=webp',
        imageAlt: 'Server racks in a data centre, representing distributed service infrastructure',
    },
    {
        slug: 'why-business-needs-pwa',
        title: 'Why Your Business Needs a PWA (And When It Does Not)',
        excerpt:
            'Progressive Web Apps install, work offline and skip app-store review. They also cannot do everything native can. Where the line actually falls in 2026.',
        category: 'Web Development',
        tags: ['PWA', 'Service workers', 'Mobile web', 'Offline'],
        authorId: 'anu-kumar',
        published: '2024-03-30',
        updated: '2026-10-05',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop&q=75&fm=webp',
        imageAlt: 'A web application being used on a phone and a laptop at the same time',
    },
];

/** Slug -> post, for the article components. */
export const BLOG_POSTS_BY_SLUG = Object.fromEntries(
    BLOG_POSTS.map((post) => [post.slug, post]),
);

/** @returns {typeof BLOG_POSTS[number]} */
export function getPost(slug) {
    const post = BLOG_POSTS_BY_SLUG[slug];
    if (!post) throw new Error(`Unknown blog slug: ${slug}`);
    return post;
}

/** Newest revision first — the order the blog index and homepage render in. */
export const BLOG_POSTS_BY_RECENCY = [...BLOG_POSTS].sort((a, b) =>
    b.updated.localeCompare(a.updated) || b.published.localeCompare(a.published),
);

/** `Mar 20, 2024` — the byline format the articles already used. */
export function formatPostDate(iso) {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
    });
}

/**
 * A card-sized variant of a post's `image`.
 *
 * `post.image` is sized for og:image — 1200x630, which the article pages
 * declare in og:image:width/height. The blog index and the homepage teaser
 * render the same URL into cards about 400px wide and 208px tall, so every
 * visitor downloaded a 1200-wide social-preview image per card.
 *
 * Unsplash resizes on request, so the card just asks for what it needs. Pass
 * the width you want; `cardImageSrcSet` builds the 1x/2x candidates.
 */
export function cardImage(image, width = 600) {
    return image.replace(/([?&])w=\d+/, `$1w=${width}`).replace(/([&?])h=\d+/, `$1h=${Math.round(width * 0.525)}`);
}

/** `srcSet` for a post card, for use with sizes="(max-width: 768px) 100vw, 400px". */
export function cardImageSrcSet(image) {
    return [400, 600, 800].map((w) => `${cardImage(image, w)} ${w}w`).join(', ');
}
