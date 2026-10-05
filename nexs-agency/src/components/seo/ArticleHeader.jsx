import { Link } from 'react-router-dom';
import { getAuthor } from '../../constants/authors';
import { getPost, formatPostDate } from '../../constants/blogPosts';

/**
 * Category, H1, byline and hero image for an article.
 *
 * The byline states both dates. Showing only the original March 2024 date on a
 * post about 2026 made the page argue with itself; showing only a refreshed
 * date would hide when the piece first ran. Both, with the revision date
 * carried in <time dateTime> so it is machine-readable as well as visible.
 */
export default function ArticleHeader({ slug, accent = 'blue' }) {
    const post = getPost(slug);
    const author = getAuthor(post.authorId);
    const revised = post.updated !== post.published;

    const badge = {
        blue: 'bg-blue-100 text-blue-700',
        orange: 'bg-orange-100 text-orange-700',
        purple: 'bg-purple-100 text-purple-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        indigo: 'bg-indigo-100 text-indigo-700',
    }[accent] ?? 'bg-blue-100 text-blue-700';

    return (
        <>
            <div className="mb-12 text-center">
                <span className={`inline-block px-4 py-1.5 font-bold rounded-full text-sm mb-6 ${badge}`}>
                    {post.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-slate-800">
                    {post.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 font-medium">
                    <span className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold"
                        >
                            {author.name.charAt(0)}
                        </span>
                        {/* Linked so the byline reaches the author page, which is what
                            gives the Person entity a resolvable url. */}
                        <Link to={`/authors/${author.id}`} className="hover:text-[#2563EB] transition-colors">
                            {author.name}
                        </Link>
                        <span className="text-slate-400">· {author.jobTitle}</span>
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>
                        Published <time dateTime={post.published}>{formatPostDate(post.published)}</time>
                    </span>
                    {revised && (
                        <>
                            <span aria-hidden="true">•</span>
                            <span className="text-slate-700">
                                Updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
                            </span>
                        </>
                    )}
                    <span aria-hidden="true">•</span>
                    <span>{post.readTime}</span>
                </div>
            </div>

            <div className="rounded-[2rem] overflow-hidden shadow-2xl mb-16 h-[500px]">
                <img
                    src={post.image}
                    alt={post.imageAlt}
                    width={1200}
                    height={500}
                    // The hero is the LCP element on every article. It was
                    // loading="lazy", which defers the one image the viewer is
                    // already looking at.
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                />
            </div>
        </>
    );
}
