import { getAuthor } from '../../constants/authors';
import { getPost, formatPostDate } from '../../constants/blogPosts';

/**
 * Author credentials and the article's source list.
 *
 * Both are authority signals that every post was missing. The articles made
 * claims about costs, framework performance and AI adoption and cited nothing:
 * the only external links in the rendered HTML were fonts, a CDN, Unsplash and
 * our own social profiles. A named source list is also the part of a page an
 * answer engine can most easily verify a claim against.
 *
 * `sources` is `[{ title, publisher, url, date? }]`. Link primary sources —
 * the study, the vendor's own documentation, the official release note — not a
 * blog post summarising one.
 */
export default function ArticleFooter({ slug, sources = [] }) {
    const post = getPost(slug);
    const author = getAuthor(post.authorId);

    return (
        <div className="max-w-4xl mx-auto px-6 pb-16 not-prose">
            {sources.length > 0 && (
                <section aria-labelledby="sources-heading" className="mt-12 pt-8 border-t border-slate-200">
                    <h2 id="sources-heading" className="text-xl font-bold text-slate-800 mb-4">
                        Sources
                    </h2>
                    <ol className="space-y-2 text-sm text-slate-600 list-decimal pl-5">
                        {sources.map((source) => (
                            <li key={source.url}>
                                <a
                                    href={source.url}
                                    className="text-blue-700 underline hover:text-blue-900"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {source.title}
                                </a>
                                <span className="text-slate-500">
                                    {' '}— {source.publisher}
                                    {source.date ? `, ${source.date}` : ''}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section
                aria-labelledby="author-heading"
                className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl"
            >
                <h2 id="author-heading" className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
                    About the author
                </h2>
                <div className="flex items-start gap-4">
                    <span
                        aria-hidden="true"
                        className="w-12 h-12 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold"
                    >
                        {author.name.charAt(0)}
                    </span>
                    <div>
                        <p className="font-bold text-slate-800">
                            {author.name}
                            <span className="font-normal text-slate-500"> — {author.jobTitle}</span>
                        </p>
                        <p className="text-slate-600 mt-1">{author.bio}</p>
                        <p className="text-sm text-slate-500 mt-3">
                            Writes about {author.knowsAbout.slice(0, 3).join(', ').toLowerCase()}.
                        </p>
                        {author.profiles.length > 0 && (
                            <ul className="flex gap-4 mt-3 text-sm">
                                {author.profiles.map((href) => (
                                    <li key={href}>
                                        <a
                                            href={href}
                                            className="text-blue-700 underline"
                                            target="_blank"
                                            rel="noopener noreferrer me"
                                        >
                                            Profile
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                    First published {formatPostDate(post.published)}
                    {post.updated !== post.published && <> · last reviewed {formatPostDate(post.updated)}</>}
                </p>
            </section>
        </div>
    );
}
