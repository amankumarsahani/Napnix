import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import RelatedServices from '../../components/seo/RelatedServices';
import ArticleSchema from '../../components/seo/ArticleSchema';
import ArticleHeader from '../../components/seo/ArticleHeader';
import ArticleFooter from '../../components/seo/ArticleFooter';
import { AnswerBlock, DataTable, BarChart } from '../../components/seo/ArticleBlocks';
import { SITE_URL } from '../../constants/siteConfig';
import { getPost } from '../../constants/blogPosts';

const SLUG = 'monolith-to-microservices';

const SOURCES = [
    {
        title: 'StranglerFigApplication',
        publisher: 'Martin Fowler',
        url: 'https://martinfowler.com/bliki/StranglerFigApplication.html',
    },
    {
        title: 'Saga pattern for distributed transactions',
        publisher: 'Microsoft Azure Architecture Center',
        url: 'https://learn.microsoft.com/azure/architecture/reference-architectures/saga/saga',
    },
    {
        title: 'OpenTelemetry — vendor-neutral distributed tracing',
        publisher: 'Cloud Native Computing Foundation',
        url: 'https://opentelemetry.io/docs/',
    },
    {
        title: 'MonolithFirst — why starting with microservices usually backfires',
        publisher: 'Martin Fowler',
        url: 'https://martinfowler.com/bliki/MonolithFirst.html',
    },
];

const MonolithToMicroservices = () => {
    const post = getPost(SLUG);
    const url = `${SITE_URL}/blog/${SLUG}`;
    const metaTitle = 'Monolith to Microservices: A Step-by-Step Migration Guide | Napnix';

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-600 selection:text-white pt-20">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={post.excerpt} />
                <link rel="canonical" href={url} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={url} />
                <meta property="og:image" content={post.image} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={post.excerpt} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <meta property="og:site_name" content="Napnix" />
                <meta property="og:locale" content="en_IN" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:site" content="@napnix" />
                <meta name="twitter:creator" content="@napnix" />
                <meta property="article:published_time" content={post.published} />
                <meta property="article:modified_time" content={post.updated} />
            </Helmet>
            <ArticleSchema slug={SLUG} />

            <article className="max-w-4xl mx-auto px-6 py-12">
                <ArticleHeader slug={SLUG} accent="purple" />

                <div className="prose prose-lg prose-purple mx-auto">
                    <AnswerBlock question="How do you migrate a monolith to microservices?">
                        <p>
                            Use the <strong>strangler fig pattern</strong>: never rewrite the whole
                            system at once. Put a gateway in front of the monolith, extract one
                            low-risk domain into its own service, route that traffic to the new
                            service, delete the old code path, then repeat. Each pass is independently
                            shippable and independently reversible, which is what keeps the migration
                            survivable.
                        </p>
                    </AnswerBlock>

                    <p className="lead text-xl text-slate-600 mb-8">
                        Monoliths are not a mistake. Most should stay monoliths. But when a ten-year-old
                        application needs a full-system deploy to change a button colour, you have a
                        velocity problem — and that is a reason to decompose, where "it feels dated"
                        is not.
                    </p>

                    <h2>Should you migrate at all?</h2>
                    <p>
                        Start here, because the honest answer is often no. Microservices trade a
                        simple deployment story for a distributed systems problem: network failures,
                        partial outages, no cross-service transactions, and far harder debugging. You
                        are buying independent deployability and paying in operational complexity.
                    </p>
                    <p>Decompose when at least two of these are true:</p>
                    <ul>
                        <li>More than roughly 20 engineers are contending for the same deploy pipeline.</li>
                        <li>Release cadence is slower than weekly because of coordination, not testing.</li>
                        <li>One component's load forces you to scale the entire application.</li>
                        <li>Distinct parts genuinely need different runtimes or data stores.</li>
                    </ul>
                    <p>
                        If none of those apply, a well-modularised monolith will serve you better and
                        cost less to run.
                    </p>

                    <h2>The strangler fig sequence</h2>
                    <p>
                        Named for the vine that grows around a tree until it stands on its own, this is
                        the migration order we use. Do it once per domain, and finish each pass before
                        starting the next:
                    </p>
                    <ol>
                        <li>
                            <strong>Put a gateway in front.</strong> All traffic routes through an API
                            gateway while the monolith still serves every request. Nothing has changed
                            functionally — you have simply gained a seam to redirect at.
                        </li>
                        <li>
                            <strong>Pick a low-risk, low-coupling domain.</strong> Notifications,
                            PDF generation, search indexing. Not billing, and not authentication.
                        </li>
                        <li>
                            <strong>Build the service, and its data boundary.</strong> The service owns
                            its own storage. If it still reads the monolith's tables directly, you have
                            built a distributed monolith — the worst of both designs.
                        </li>
                        <li>
                            <strong>Shadow the traffic.</strong> Send real requests to both paths,
                            compare the outputs, and fix the differences before anything depends on the
                            new service. This is the step most teams skip and most regret skipping.
                        </li>
                        <li>
                            <strong>Cut over behind a flag,</strong> so reverting is a config change
                            rather than a deploy.
                        </li>
                        <li>
                            <strong>Delete the old code path.</strong> Not later — now. Dead code left
                            in the monolith is the reason migrations stall half-finished and leave you
                            maintaining both designs forever.
                        </li>
                        <li><strong>Repeat</strong> with the next domain.</li>
                    </ol>

                    <div className="bg-purple-50 border-l-4 border-purple-600 p-8 my-8 rounded-r-xl not-prose">
                        <p className="text-xl font-bold text-purple-900 mb-2">Planning a migration?</p>
                        <p className="text-purple-800 mb-0">
                            Our cloud architects can review your decomposition roadmap before you
                            commit to it.{' '}
                            <Link to="/services/cloud-solutions" className="underline font-bold">
                                Learn about our cloud services
                            </Link>.
                        </p>
                    </div>

                    <BarChart
                        caption="Where migration effort actually goes on a typical six-domain extraction (Napnix delivery data, 2026). Percentages of total migration effort."
                        data={[
                            { label: 'Service extraction', value: 35, display: '35%' },
                            { label: 'Data separation', value: 25, display: '25% — the usual blocker' },
                            { label: 'Observability setup', value: 15, display: '15%' },
                            { label: 'Shadow testing', value: 15, display: '15%' },
                            { label: 'Deleting old paths', value: 10, display: '10%' },
                        ]}
                    />

                    <h2>What breaks, and what to do about it</h2>

                    <DataTable
                        caption="The four failure modes that account for most stalled migrations, and the standard remedy for each."
                        columns={['What breaks', 'Why', 'Remedy']}
                        rows={[
                            [
                                'Debugging',
                                'One request now spans several services and logs',
                                'Distributed tracing via OpenTelemetry, from day one',
                            ],
                            [
                                'Transactions',
                                'ACID guarantees do not cross service boundaries',
                                'Saga pattern with explicit compensating actions',
                            ],
                            [
                                'Data ownership',
                                'Shared tables recreate the coupling you removed',
                                'One datastore per service; integrate through APIs or events',
                            ],
                            [
                                'Local development',
                                'Running twelve services on a laptop stops being practical',
                                'Containerised stack plus contract tests, not full local parity',
                            ],
                        ]}
                    />

                    <h2>The bottom line</h2>
                    <p>
                        Microservices buy deployment independence, and they are an investment in team
                        speed rather than in raw performance. Migrate one domain at a time, keep each
                        step reversible, and delete the old path every time. If your team is under
                        twenty engineers and shipping weekly, the better architectural decision is
                        usually to modularise what you have.
                    </p>
                </div>
            </article>

            <ArticleFooter slug={SLUG} sources={SOURCES} />

            <div className="bg-[#F8FAFC] py-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center mb-12">Modernise Your Architecture</h2>
                    <RelatedServices currentService="Cloud Solutions" />
                </div>
            </div>
        </div>
    );
};

export default MonolithToMicroservices;
