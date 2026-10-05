import { SITE_URL, LOGO_URL, siteConfig } from '../../constants/siteConfig';
import { getAuthor } from '../../constants/authors';
import { getPost } from '../../constants/blogPosts';

/**
 * BlogPosting + Person + BreadcrumbList JSON-LD for one article.
 *
 * Rendered inside the component tree, not through Helmet, and deliberately so.
 * Helmet commits its tags into <head>, which sits outside #root, and the
 * prerender script's third-party-script sweep removed everything outside #root
 * — so the Article schema each post declared never reached the published HTML.
 * prerender.mjs now exempts application/ld+json, but keeping the block inside
 * #root means it survives regardless of what that sweep does next.
 *
 * `dateModified` is what freshness-sensitive surfaces read. It comes from the
 * post manifest, where it tracks real revisions to the prose — see the note in
 * constants/blogPosts.js before changing one.
 */
export default function ArticleSchema({ slug }) {
    const post = getPost(slug);
    const author = getAuthor(post.authorId);
    const url = `${SITE_URL}/blog/${post.slug}`;

    const person = {
        '@type': 'Person',
        // @id and url both point at the author page. Without a url the entity
        // terminated at the byline and nothing could corroborate it; with one,
        // every post by this author resolves to the same Person rather than
        // looking like a fresh, unknown name each time.
        '@id': `${SITE_URL}/authors/${author.id}#person`,
        url: `${SITE_URL}/authors/${author.id}`,
        name: author.name,
        jobTitle: author.jobTitle,
        description: author.bio,
        knowsAbout: author.knowsAbout,
        // A bare @id reference, so the one Organization node defined by
        // SiteSchema is reused rather than a competing copy declared here.
        worksFor: { '@id': `${SITE_URL}/#organization` },
        // Only emitted once a real personal profile exists. A Person.sameAs
        // pointing at the company page would merge the author into the org.
        ...(author.profiles.length ? { sameAs: author.profiles } : {}),
    };

    const blogPosting = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: {
            '@type': 'ImageObject',
            url: post.image,
            caption: post.imageAlt,
        },
        author: person,
        publisher: {
            '@type': 'Organization',
            name: siteConfig.brandName,
            url: SITE_URL,
            logo: { '@type': 'ImageObject', url: LOGO_URL },
        },
        datePublished: post.published,
        dateModified: post.updated,
        articleSection: post.category,
        inLanguage: 'en',
        isAccessibleForFree: true,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
    };

    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
    };

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(blogPosting)}</script>
            <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
        </>
    );
}
