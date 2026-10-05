import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackToTop from '../components/ui/BackToTop';
import { SITE_URL, siteConfig } from '../constants/siteConfig';
import { AUTHORS, getAuthor } from '../constants/authors';
import { BLOG_POSTS_BY_RECENCY, formatPostDate } from '../constants/blogPosts';

/**
 * `/authors/:authorId` — a real page for each named author.
 *
 * Why: the E-E-A-T assessment scored Authoritativeness at 28/100, and the
 * single biggest reason was that the people behind the content had no
 * identity a reader or a crawler could resolve. Each post carried a Person
 * node with a name, a job title and knowsAbout, but no `url` — so the entity
 * terminated at the byline and could not be corroborated.
 *
 * A page per author gives Person.url something to point at, collects that
 * person's articles in one place, and lets a reader judge who wrote what.
 * That is the part of E-E-A-T that is actually within our control: Experience
 * and Expertise can be demonstrated, whereas Authoritativeness largely depends
 * on other people citing you.
 *
 * `sameAs` is still omitted. See the note in constants/authors.js — pointing it
 * at the company LinkedIn would conflate the author with the organisation,
 * which is worse than leaving it out. Add each person's own profile URLs to
 * `profiles` in that file and they flow in here automatically.
 */
export default function AuthorPage() {
    const { authorId } = useParams();

    if (!AUTHORS[authorId]) return <Navigate to="/blog" replace />;

    const author = getAuthor(authorId);
    const pageUrl = `${SITE_URL}/authors/${author.id}`;
    const posts = BLOG_POSTS_BY_RECENCY.filter((p) => p.authorId === author.id);

    const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${pageUrl}#person`,
        name: author.name,
        url: pageUrl,
        jobTitle: author.jobTitle,
        description: author.bio,
        knowsAbout: author.knowsAbout,
        worksFor: { '@id': `${SITE_URL}/#organization` },
        ...(author.profiles.length ? { sameAs: author.profiles } : {}),
    };

    const description = `${author.name}, ${author.jobTitle} at ${siteConfig.brandName}. `
        + `${posts.length} article${posts.length === 1 ? '' : 's'} on `
        + `${author.knowsAbout.slice(0, 2).join(' and ').toLowerCase()}.`;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Helmet>
                <title>{`${author.name} — ${author.jobTitle} at ${siteConfig.brandName}`}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={pageUrl} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <meta property="og:title" content={`${author.name} — ${author.jobTitle}`} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:type" content="profile" />
                <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
            </Helmet>

            {/* Inside the tree rather than Helmet, for the same reason as
                ArticleSchema: head tags live outside #root. */}
            <script type="application/ld+json">{JSON.stringify(personSchema)}</script>

            <section className="pt-32 pb-12 bg-slate-900 text-white">
                <div className="container-custom max-w-3xl">
                    <Breadcrumbs />
                    <div className="flex items-center gap-5 mt-6">
                        <span
                            aria-hidden="true"
                            className="w-16 h-16 flex-shrink-0 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center text-2xl font-bold"
                        >
                            {author.name.charAt(0)}
                        </span>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{author.name}</h1>
                            <p className="text-slate-300 mt-1">{author.jobTitle}, {siteConfig.brandName}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14">
                <div className="container-custom max-w-3xl">
                    <p className="text-lg text-slate-600 leading-relaxed mb-10">{author.bio}</p>

                    <h2 className="text-xl font-bold text-slate-800 mb-4">Writes about</h2>
                    <ul className="flex flex-wrap gap-2 mb-12">
                        {author.knowsAbout.map((topic) => (
                            <li
                                key={topic}
                                className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-sm text-slate-700"
                            >
                                {topic}
                            </li>
                        ))}
                    </ul>

                    <h2 className="text-xl font-bold text-slate-800 mb-5">
                        {posts.length} article{posts.length === 1 ? '' : 's'} by {author.name.split(' ')[0]}
                    </h2>
                    <ul className="space-y-5 mb-12">
                        {posts.map((post) => (
                            <li key={post.slug} className="border-b border-slate-200 pb-5 last:border-0">
                                <Link
                                    to={`/blog/${post.slug}`}
                                    className="text-lg font-semibold text-slate-800 hover:text-[#2563EB] transition-colors"
                                >
                                    {post.title}
                                </Link>
                                <p className="text-slate-600 text-sm mt-2 leading-relaxed">{post.excerpt}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                    <time dateTime={post.published}>{formatPostDate(post.published)}</time>
                                    {post.updated !== post.published && (
                                        <> · revised <time dateTime={post.updated}>{formatPostDate(post.updated)}</time></>
                                    )}
                                </p>
                            </li>
                        ))}
                    </ul>

                    <p className="text-slate-600">
                        <Link to="/blog" className="text-[#2563EB] font-medium hover:underline">
                            All Napnix articles
                        </Link>
                        {' · '}
                        <Link to="/about" className="text-[#2563EB] font-medium hover:underline">
                            About Napnix
                        </Link>
                        {' · '}
                        <Link to="/contact" className="text-[#2563EB] font-medium hover:underline">
                            Get in touch
                        </Link>
                    </p>
                </div>
            </section>

            <BackToTop />
        </div>
    );
}
