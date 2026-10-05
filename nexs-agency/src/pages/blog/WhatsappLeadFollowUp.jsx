import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import RelatedServices from '../../components/seo/RelatedServices';
import ArticleSchema from '../../components/seo/ArticleSchema';
import ArticleHeader from '../../components/seo/ArticleHeader';
import ArticleFooter from '../../components/seo/ArticleFooter';
import { AnswerBlock, DataTable } from '../../components/seo/ArticleBlocks';
import { SITE_URL } from '../../constants/siteConfig';
import { getPost } from '../../constants/blogPosts';

/**
 * Lead follow-up automation — the cluster that had zero pages.
 *
 * The clustering analysis found this was the site's starkest gap: the homepage
 * title is "Napnix | CRM & Lead Follow-Up for Service Businesses" and there was
 * not one page on the subject. This is the informational entry point for that
 * cluster, pointing at /napcrm and /services/crm-development as the commercial
 * destinations.
 *
 * WhatsApp specifically, because that is where Indian service-business
 * enquiries actually get answered, and it is the angle a generic
 * "lead nurturing" post would miss.
 */
const SLUG = 'whatsapp-lead-follow-up';

const SOURCES = [
    {
        title: 'WhatsApp Business Platform — conversation-based pricing',
        publisher: 'Meta',
        url: 'https://developers.facebook.com/docs/whatsapp/pricing/',
    },
    {
        title: 'WhatsApp Business Platform — message template guidelines',
        publisher: 'Meta',
        url: 'https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/',
    },
    {
        title: 'NapCRM pricing — the follow-up automation referenced below',
        publisher: 'Napnix',
        url: `${SITE_URL}/napcrm/pricing`,
    },
];

const WhatsappLeadFollowUp = () => {
    const post = getPost(SLUG);
    const url = `${SITE_URL}/blog/${SLUG}`;
    const metaTitle = 'WhatsApp Lead Follow-Up That Actually Converts | Napnix';

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
                <ArticleHeader slug={SLUG} accent="blue" />

                <div className="prose prose-lg prose-blue mx-auto">
                    <AnswerBlock question="How fast do you have to reply to a lead?">
                        <p>
                            Within five minutes, or the enquiry has usually gone cold. The
                            practical target for a small team is the same business hour, with an
                            automated acknowledgement inside one minute so the enquirer knows a
                            human is coming. What loses deals is not a slow answer — it is silence.
                        </p>
                    </AnswerBlock>

                    <p>
                        Almost every &ldquo;we need more leads&rdquo; conversation we have turns out
                        to be a follow-up problem. The enquiries are arriving. They are being read.
                        Someone means to reply after this one job, and then the day ends. Two days
                        later the customer has booked someone else, and the business concludes it
                        needs more marketing.
                    </p>

                    <p>
                        This is the cheapest problem in a service business to fix, because it needs
                        no new spend on acquisition. It needs an owner per enquiry and a system that
                        notices silence.
                    </p>

                    <h2>Why WhatsApp, not email</h2>

                    <p>
                        For Indian service businesses the follow-up channel question is largely
                        settled. Email open rates for a cold quote are poor and the reply lands in a
                        promotions tab; a WhatsApp message gets read. More importantly, it gets
                        <em> replied to</em>, which is the only metric that matters when you are
                        trying to book a site visit.
                    </p>

                    <p>
                        That has a cost implication worth planning for. The WhatsApp Business
                        Platform bills per conversation rather than per message, and business-
                        initiated conversations cost more than user-initiated ones. So a follow-up
                        sequence is a usage cost that grows with your pipeline rather than a fixed
                        line item. Model it at your expected enquiry volume before you build it —
                        this is the single most common surprise in WhatsApp automation projects.
                    </p>

                    <p>
                        The other constraint is that business-initiated messages must use a
                        pre-approved template. You cannot free-type a follow-up to someone who has
                        not messaged you in the last 24 hours. Design the sequence around approved
                        templates from the start rather than discovering that limit after build.
                    </p>

                    <h2>What a follow-up sequence should actually do</h2>

                    <p>
                        The instinct is to send more messages. The thing that works is to assign an
                        owner and escalate on silence. A sequence that covers the first week:
                    </p>

                    <DataTable
                        caption="A first-week follow-up sequence for a service-business enquiry."
                        columns={['When', 'What happens', 'Who does it']}
                        rows={[
                            ['Within 1 minute', 'Automated acknowledgement naming what was asked about and when a human will reply', 'System'],
                            ['Within the hour', 'Real reply with a specific next step — a time for a call or a visit, not "we will get back to you"', 'Assigned owner'],
                            ['Day 1, no reply', 'One short nudge on the same thread', 'System'],
                            ['Day 3, no reply', 'Different angle: a price range, a comparable job, or a direct question', 'Assigned owner'],
                            ['Day 5, no reply', 'Escalation to a manager, or reassignment', 'System → manager'],
                            ['Day 7, no reply', 'Marked dormant with a reason, and a 60-day re-contact scheduled', 'System'],
                        ]}
                    />

                    <p>
                        Two details do most of the work. The first is that every enquiry has exactly
                        one named owner, because an enquiry owned by &ldquo;the team&rdquo; is owned
                        by nobody. The second is the day-5 escalation: the system has to tell someone
                        when an enquiry has gone quiet, because the person who dropped it is by
                        definition not going to notice.
                    </p>

                    <h2>What the automation costs to run</h2>

                    <AnswerBlock question="What does WhatsApp follow-up automation cost per month?">
                        <p>
                            The software is the small part. Budget for WhatsApp conversation
                            charges, which scale with your enquiry volume: a business handling 300
                            enquiries a month with a three-message sequence is paying for roughly
                            900 business-initiated conversations, not 300. Model it at your real
                            volume before building.
                        </p>
                    </AnswerBlock>

                    <p>
                        The mistake is to price the CRM and forget the messaging. Three things make
                        up the running cost, and only one of them is fixed:
                    </p>

                    <ul>
                        <li>
                            <strong>The CRM itself</strong> &mdash; fixed and predictable. A
                            configured tier, or the amortised cost of a build.
                        </li>
                        <li>
                            <strong>WhatsApp conversations</strong> &mdash; variable, and the one
                            that surprises people. Meta bills per 24-hour conversation window, with
                            business-initiated windows costing more than ones the customer opens.
                            Every automated nudge in your sequence is a separate business-initiated
                            conversation if the customer has not replied in between, which is
                            exactly the case you built the nudge for.
                        </li>
                        <li>
                            <strong>Template maintenance</strong> &mdash; small but real. Templates
                            need approval, and a rejected or paused template silently breaks the
                            sequence until someone notices. Put that on a person, not a wiki page.
                        </li>
                    </ul>

                    <p>
                        A useful way to size it: take your monthly enquiry count, multiply by the
                        number of automated touches in the sequence, and treat that as your
                        conversation volume ceiling. It will be lower in practice, because customers
                        who reply convert the window to user-initiated, but sizing on the ceiling
                        means the bill never surprises you. Then sanity-check it against the value
                        of one additional booked job &mdash; for most service businesses the whole
                        monthly messaging cost is less than a single conversion, which is what makes
                        this worth doing at all.
                    </p>

                    <p>
                        One more constraint worth designing around early: sequences that fire outside
                        working hours annoy people and burn conversations for nothing. Gate the
                        automated touches to business hours in the customer&rsquo;s timezone, and
                        keep the one-minute acknowledgement as the only message that can go out at
                        any time.
                    </p>

                    <h2>What to measure</h2>

                    <p>
                        Three numbers tell you whether follow-up is working, and none of them is
                        &ldquo;leads received&rdquo;:
                    </p>

                    <ul>
                        <li>
                            <strong>Median time to first human reply.</strong> Not average — one
                            forgotten enquiry at four days drags an average into uselessness.
                        </li>
                        <li>
                            <strong>Share of enquiries with no reply after 24 hours.</strong> This
                            should be near zero. In most businesses that have never measured it, it
                            is between a fifth and a third.
                        </li>
                        <li>
                            <strong>Share reaching a defined outcome</strong> — quoted, booked, or
                            explicitly marked lost with a reason. Enquiries with no outcome are the
                            ones quietly costing you money.
                        </li>
                    </ul>

                    <p>
                        If you do not know those three numbers today, that is the finding. Our{' '}
                        <Link to="/audit">Revenue-Leak Audit</Link> is a free 20-minute pass over
                        exactly this: where enquiries enter, who owns them, and where they stop.
                    </p>

                    <h2>Build it or configure it</h2>

                    <p>
                        None of the above needs custom software. A configured CRM with WhatsApp
                        integration, assignment rules and escalation timers covers it, and that is
                        what <Link to="/napcrm">NapCRM</Link> does from the Growth tier up — see{' '}
                        <Link to="/napcrm/pricing">pricing</Link> for the tier limits.
                    </p>

                    <p>
                        A custom build earns its cost when the routing logic is genuinely unusual —
                        multi-branch assignment, field-team dispatch, or follow-up that depends on
                        inventory or scheduling state. That is a{' '}
                        <Link to="/services/crm-development">CRM development</Link> project, and the{' '}
                        <Link to="/blog/cost-of-custom-crm-2026">cost guide</Link> works through
                        when building beats configuring.
                    </p>

                    <h2>The bottom line</h2>

                    <p>
                        Follow-up is an ownership problem wearing a software costume. Automation is
                        worth having because it removes the chance of silence going unnoticed, not
                        because it replaces the reply. Assign every enquiry to a person, acknowledge
                        inside a minute, escalate on day five, and measure the median time to a human
                        reply. The leads you already have will convert better than the ones you were
                        about to go and buy.
                    </p>
                </div>
            </article>

            <ArticleFooter slug={SLUG} sources={SOURCES} />

            <section className="bg-slate-50 py-20">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center mb-12">Related Services</h2>
                    <RelatedServices currentService="CRM Development" />
                </div>
            </section>
        </div>
    );
};

export default WhatsappLeadFollowUp;
