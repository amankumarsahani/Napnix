import { Link } from 'react-router-dom';
import { SITE_URL } from '../../constants/siteConfig';
import { BLOG_POSTS_BY_RECENCY, formatPostDate } from '../../constants/blogPosts';
import { getAuthor } from '../../constants/authors';

/**
 * The hand-written guides, rendered from the local manifest rather than fetched.
 *
 * Two problems this solves at once.
 *
 * Nothing on the site linked to these five articles. The blog feed below is
 * API-driven and the homepage pointed at three slugs that were never built, so
 * the only route a crawler had into them was the sitemap — they were orphans
 * with real content and no inbound links.
 *
 * And /blog itself never prerendered. The page returned a bare spinner until the
 * API answered, which at build time it never does, so the route fell under
 * prerender's minimum-text floor and shipped the SPA shell instead. A section
 * built from local data renders identically with no backend, which puts the
 * route over that floor and gives /blog real HTML for the first time.
 *
 * @param {{ heading?: string, limit?: number, className?: string }} props
 */
export default function CuratedGuides({
    heading = 'In-depth guides',
    limit = BLOG_POSTS_BY_RECENCY.length,
    className = '',
}) {
    const posts = BLOG_POSTS_BY_RECENCY.slice(0, limit);

    // ItemList rather than a bare Blog node: it names the posts and their order,
    // which is what lets an answer engine treat this as a list of articles
    // instead of one page of prose. Rendered inside #root, like SiteSchema.
    const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: heading,
        itemListElement: posts.map((post, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/blog/${post.slug}`,
            name: post.title,
        })),
    };

    return (
        <section aria-labelledby="curated-guides-heading" className={`container-custom py-16 ${className}`}>
            <script type="application/ld+json">{JSON.stringify(itemList)}</script>
            <h2 id="curated-guides-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                {heading}
            </h2>
            <p className="text-slate-600 mb-10 max-w-2xl">
                Long-form guides written by the Napnix engineering team, reviewed and kept current.
            </p>

            <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
                {posts.map((post) => {
                    const author = getAuthor(post.authorId);
                    return (
                        <li
                            key={post.slug}
                            className="group flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-xl transition-shadow"
                        >
                            <Link to={`/blog/${post.slug}`} className="block overflow-hidden h-44">
                                <img
                                    src={post.image}
                                    alt={post.imageAlt}
                                    width={600}
                                    height={176}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </Link>
                            <div className="flex flex-col flex-1 p-6">
                                <p className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-2">
                                    {post.category}
                                </p>
                                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                                    <Link to={`/blog/${post.slug}`} className="hover:text-blue-700">
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="text-sm text-slate-600 flex-1">{post.excerpt}</p>
                                <p className="text-xs text-slate-500 mt-4">
                                    {author.name} · {author.jobTitle}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
                                    {' · '}{post.readTime}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
