import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import RelatedServices from '../../components/seo/RelatedServices';
import ArticleSchema from '../../components/seo/ArticleSchema';
import ArticleHeader from '../../components/seo/ArticleHeader';
import ArticleFooter from '../../components/seo/ArticleFooter';
import { AnswerBlock, DataTable, BarChart } from '../../components/seo/ArticleBlocks';
import { SITE_URL } from '../../constants/siteConfig';
import { getPost } from '../../constants/blogPosts';

const SLUG = 'cost-of-custom-crm-2026';

const SOURCES = [
    {
        title: 'Salesforce Sales Cloud pricing',
        publisher: 'Salesforce',
        url: 'https://www.salesforce.com/sales/pricing/',
    },
    {
        title: 'HubSpot Sales Hub pricing',
        publisher: 'HubSpot',
        url: 'https://www.hubspot.com/pricing/sales',
    },
    {
        title: 'AWS Pricing Calculator — for estimating the hosting line',
        publisher: 'Amazon Web Services',
        url: 'https://calculator.aws/',
    },
    {
        title: 'NapCRM pricing — the off-the-shelf comparison point used below',
        publisher: 'Napnix',
        url: `${SITE_URL}/napcrm/pricing`,
    },
];

const CostOfCustomCrm = () => {
    const post = getPost(SLUG);
    const url = `${SITE_URL}/blog/${SLUG}`;
    const metaTitle = 'Cost of Building a Custom CRM in 2026 | Napnix Blog';

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
                <ArticleHeader slug={SLUG} accent="orange" />

                <div className="prose prose-lg prose-orange mx-auto">
                    <AnswerBlock question="How much does a custom CRM cost in 2026?">
                        <p>
                            A custom CRM costs <strong>$30,000 to $250,000+</strong> to build in 2026.
                            An MVP for a small team runs $30,000–$50,000 over 2–3 months; a mid-market
                            system with integrations runs $50,000–$100,000 over 4–6 months; an
                            enterprise build with compliance requirements runs $100,000–$250,000+ over
                            6–12 months. Budget a further 15–20% of the build cost per year for
                            maintenance.
                        </p>
                    </AnswerBlock>

                    <p className="lead text-xl text-slate-600 mb-8">
                        Off-the-shelf CRMs are powerful but priced per seat and rigid in their
                        workflows. A custom CRM trades a large upfront cost for workflows that match
                        how you actually operate and no per-seat licence. Whether that trade pays off
                        depends almost entirely on headcount and how unusual your process is.
                    </p>

                    <h2>What drives the cost?</h2>

                    <DataTable
                        caption="Custom CRM build cost by tier. Ranges are Napnix delivery estimates for 2026 and assume a React/Node stack."
                        columns={['Tier', 'Est. cost', 'Timeline', 'Best for']}
                        rows={[
                            ['MVP CRM', '$30k – $50k', '2–3 months', 'Startups, small agencies'],
                            ['Mid-market', '$50k – $100k', '4–6 months', 'Growing SMBs, real estate'],
                            ['Enterprise', '$100k – $250k+', '6–12 months', 'Large firms, fintech, healthcare'],
                        ]}
                    />

                    <p>
                        Within a tier, four factors move the number more than anything else. They are
                        listed in the order they typically bite:
                    </p>

                    <ol>
                        <li>
                            <strong>Feature set.</strong> A contact database with a pipeline is cheap.
                            AI lead scoring, automated multi-channel follow-up and custom reporting are
                            what push a build from one tier into the next.
                        </li>
                        <li>
                            <strong>Tech stack.</strong> A modern React and Node.js stack is
                            materially cheaper to build and hire for than a legacy enterprise Java
                            stack, largely because the talent pool is deeper.
                        </li>
                        <li>
                            <strong>Integrations.</strong> Each major integration — Gmail, Outlook,
                            Stripe, QuickBooks, a telephony provider — adds roughly 10–20% to the
                            budget, because each one brings its own auth model, rate limits and
                            failure modes.
                        </li>
                        <li>
                            <strong>Data migration.</strong> Moving years of records out of
                            spreadsheets or a legacy system is routinely 15% of the total, and it is
                            the line most often left out of a first estimate.
                        </li>
                    </ol>

                    <BarChart
                        caption="Where the budget goes on a typical $75,000 mid-market build (Napnix delivery data, 2026). Percentages of total project cost."
                        data={[
                            { label: 'Core development', value: 45, display: '45% · ~$34k' },
                            { label: 'Integrations', value: 18, display: '18% · ~$13k' },
                            { label: 'Data migration', value: 15, display: '15% · ~$11k' },
                            { label: 'Design & UX', value: 12, display: '12% · ~$9k' },
                            { label: 'QA & testing', value: 10, display: '10% · ~$7k' },
                        ]}
                    />

                    <h2>What are the hidden running costs?</h2>

                    <AnswerBlock question="What does a custom CRM cost to run after launch?">
                        <p>
                            Expect three recurring lines after launch: cloud hosting at roughly
                            $200–$1,000 per month depending on data volume and traffic, annual
                            maintenance at 15–20% of the original build cost, and one-off team
                            training. A $75,000 build therefore carries roughly $11,000–$15,000 a year
                            in upkeep before any new feature work.
                        </p>
                    </AnswerBlock>

                    <h2>When is buying the better call?</h2>
                    <p>
                        The honest answer is: more often than agencies like us tend to admit. Custom
                        wins when your workflow is genuinely unusual, when per-seat licensing on a
                        large team outgrows a one-off build, or when you need to own the data model
                        outright. Off-the-shelf wins when your process is close enough to standard
                        that configuration gets you there — and it gets you there this month rather
                        than next year.
                    </p>
                    <p>
                        For a concrete comparison point, <Link to="/napcrm/pricing">NapCRM</Link>{' '}
                        starts at ₹4,165 per month per workspace ($49). Against a $75,000 build plus
                        ~$13,000 a year of upkeep, a subscription has to run a long time before the
                        custom route is cheaper on cash alone — which is why the deciding factor is
                        usually fit, not price.
                    </p>

                    {/* The calculator is the interactive form of this guide's arithmetic;
                        linking it from here is also what keeps it out of orphan status. */}
                    <p>
                        If you would rather put your own numbers in, the{' '}
                        <Link to="/tools/crm-cost-calculator">CRM cost calculator</Link>{' '}
                        runs this comparison for your team size and horizon, and shows the year at
                        which building overtakes subscribing. Its assumptions are the ones in this
                        article.
                    </p>

                    <h2>What does a custom CRM cost in India?</h2>

                    <AnswerBlock question="What does a custom CRM cost to build in India?">
                        <p>
                            An Indian development team typically builds the same scope for 30&ndash;50% of
                            a US or UK quote. A focused single-team CRM runs about ₹4,00,000 to
                            ₹12,00,000, a mid-market build with integrations ₹12,00,000 to
                            ₹40,00,000, and a multi-tenant platform ₹40,00,000 upward. The scope,
                            not the rate, still decides most of the final number.
                        </p>
                    </AnswerBlock>

                    <p>
                        The dollar figures above are blended global rates. If you are buying from
                        India — or comparing an Indian vendor against a Western one — the arithmetic
                        changes enough to be worth stating separately.
                    </p>

                    <DataTable
                        caption="Indicative build cost in INR by scope, Indian development team, 2026."
                        columns={['Scope', 'Build cost (INR)', 'Typical timeline', 'What it covers']}
                        rows={[
                            ['Single-team CRM', '₹4,00,000 – ₹12,00,000', '8–14 weeks', 'One pipeline, one user role, reporting, email and WhatsApp follow-up'],
                            ['Mid-market', '₹12,00,000 – ₹40,00,000', '4–7 months', 'Multiple roles and permissions, ERP or accounting integration, approval flows'],
                            ['Multi-tenant platform', '₹40,00,000+', '7–14 months', 'Per-tenant isolation, billing, self-serve onboarding, admin surface'],
                        ]}
                    />

                    <p>
                        Three things specific to buying in India are worth budgeting for, and they
                        are routinely left out of quotes:
                    </p>

                    <ul>
                        <li>
                            <strong>GST at 18%</strong> on development services. On a ₹20,00,000
                            build that is ₹3,60,000, and it is recoverable as input credit if you
                            are registered — but it still has to be funded in the month it is
                            invoiced.
                        </li>
                        <li>
                            <strong>WhatsApp Business API messaging.</strong> Most Indian CRM work
                            lives or dies on WhatsApp follow-up rather than email. Meta bills per
                            conversation, so this is a usage cost that grows with your pipeline, not
                            a fixed line item. Model it at your expected enquiry volume before
                            launch.
                        </li>
                        <li>
                            <strong>Payment gateway and e-invoicing.</strong> If the CRM raises
                            invoices, it needs correct HSN codes and the CGST/SGST versus IGST split,
                            plus e-invoicing if your turnover crosses the threshold. Retrofitting
                            compliance is far more expensive than building it in.
                        </li>
                    </ul>

                    <p>
                        The cost that actually surprises people is not the build. It is the gap
                        between a system going live and the team using it, which is a training and
                        process problem rather than a software one. Budget two to four weeks of
                        someone&rsquo;s time for migration, cleanup of the data you are bringing
                        across, and sitting with the people who will use it daily. Projects that skip
                        this ship on time and get abandoned within a quarter.
                    </p>

                    <div className="bg-orange-50 border-l-4 border-orange-600 p-8 my-8 rounded-r-xl not-prose">
                        <p className="text-xl font-bold text-orange-900 mb-2">Not sure which side you fall on?</p>
                        <p className="text-orange-800 mb-0">
                            We will tell you if off-the-shelf is the better answer.{' '}
                            <Link to="/contact" className="underline font-bold">Get a scoped quote</Link>.
                        </p>
                    </div>

                    <h2>The bottom line</h2>
                    <p>
                        Over three to five years a custom CRM is usually the cheaper option for larger
                        teams, because eliminating per-seat licences compounds while the build cost is
                        paid once. For a small team on a standard process, it rarely is. Decide on
                        workflow fit and team size first, then price the winner.
                    </p>
                    <p>
                        A worked example makes the crossover concrete. A ten-person team on a
                        subscription at ₹4,165 a month pays about ₹2,50,000 over five years. The same
                        team on a ₹8,00,000 build pays that once, plus roughly 15% a year in
                        maintenance, landing near ₹14,00,000 — so the subscription wins comfortably.
                        Change the team to sixty seats and the subscription cost scales with it while
                        the build cost barely moves, and the order reverses well inside three years.
                        Seat count, not sophistication, is the variable that decides this.
                    </p>
                    <p>
                        So price the option that fits your workflow rather than shopping on headline
                        cost, and if a configured product covers 80% of what you need, take it and
                        spend the difference on the integrations and the training. That is where the
                        return actually sits.
                    </p>
                </div>
            </article>

            <ArticleFooter slug={SLUG} sources={SOURCES} />

            <div className="bg-[#F8FAFC] py-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center mb-12">Looking for Enterprise Software?</h2>
                    <RelatedServices currentService="none" />
                </div>
            </div>
        </div>
    );
};

export default CostOfCustomCrm;
