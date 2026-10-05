import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackToTop from '../components/ui/BackToTop';
import { SITE_URL } from '../constants/siteConfig';
import { crmTiers } from '../constants/crmPricing';
import {
    ALTERNATIVES,
    COMPETITOR_PRICING_VERIFIED_ON,
    getAlternative,
} from '../constants/alternatives';

/**
 * `/alternatives/:slug` — NapCRM compared with one named competitor.
 *
 * This page type exists because the SXO pass found that 7 of 9 target queries
 * return comparison pages while the site published only product and service
 * pages. See src/constants/alternatives.js for the content rules, in particular
 * why each page names the competitor's genuine strengths and NapCRM's own gaps.
 *
 * Deliberately NO FAQPage markup: Google retired FAQ rich results for all sites
 * on 7 May 2026, so it would buy nothing. The questions are plain prose, which
 * is the form an answer engine can quote anyway.
 */
export default function AlternativePage() {
    const { competitor } = useParams();

    if (!ALTERNATIVES[competitor]) return <Navigate to="/napcrm" replace />;

    const alt = getAlternative(competitor);
    const pageUrl = `${SITE_URL}/alternatives/${alt.slug}`;
    const starter = crmTiers.find((t) => t.name === 'Starter');

    /* No BreadcrumbList here on purpose: src/components/ui/Breadcrumbs.jsx
       derives the trail from the current path and emits the schema itself.
       Declaring a second one would put two BreadcrumbList objects on the page. */

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Helmet>
                {/* No " | Napnix" suffix: every title in alternatives.js already opens
                    with "NapCRM", so the brand was appearing twice and costing 9
                    characters against the ~60 char SERP truncation point. */}
                <title>{alt.title}</title>
                <meta name="description" content={alt.description} />
                <link rel="canonical" href={pageUrl} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <meta property="og:title" content={alt.title} />
                <meta property="og:description" content={alt.description} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={alt.title} />
                <meta name="twitter:description" content={alt.description} />
            </Helmet>

            <section className="pt-32 pb-16 bg-slate-900 text-white">
                <div className="container-custom max-w-4xl">
                    <Breadcrumbs />
                    <h1 className="text-3xl md:text-5xl font-bold mt-6 mb-6 leading-tight">{alt.h1}</h1>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed">{alt.intro}</p>
                </div>
            </section>

            <section className="py-16">
                <div className="container-custom max-w-4xl prose prose-slate max-w-none">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-5">
                        Why people look for a {alt.competitor} alternative
                    </h2>
                    <ul className="space-y-3 mb-12">
                        {alt.whyLook.map((reason) => (
                            <li key={reason} className="text-slate-600 leading-relaxed">{reason}</li>
                        ))}
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-5">
                        Where NapCRM fits
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-12">{alt.summary}</p>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-5">
                        NapCRM compared with {alt.competitor}
                    </h2>

                    <div className="not-prose overflow-x-auto mb-4">
                        <table className="min-w-full text-sm border-collapse">
                            <caption className="text-left text-sm text-slate-500 mb-3 caption-top">
                                NapCRM and {alt.competitor} side by side. NapCRM figures come from our
                                published pricing; {alt.competitor} figures are public list prices.
                            </caption>
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-300 text-left">
                                    <th scope="col" className="py-3 px-4 font-bold text-slate-800">&nbsp;</th>
                                    <th scope="col" className="py-3 px-4 font-bold text-slate-800">NapCRM</th>
                                    <th scope="col" className="py-3 px-4 font-bold text-slate-800">{alt.competitor}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alt.comparison.map(([label, ours, theirs]) => (
                                    <tr key={label} className="border-b border-slate-200 last:border-0 align-top">
                                        <th scope="row" className="py-3 px-4 font-semibold text-slate-700">{label}</th>
                                        <td className="py-3 px-4 text-slate-600">{ours}</td>
                                        <td className="py-3 px-4 text-slate-600">{theirs}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Stating when the competitor figures were checked, and linking to the
                        vendor's own page, is the difference between a comparison a reader can
                        trust and one they cannot verify. Prices change; this says so. */}
                    <p className="not-prose text-xs text-slate-500 mb-12">
                        {alt.competitor} list prices last checked {COMPETITOR_PRICING_VERIFIED_ON}.
                        Vendors change tier structure periodically — check{' '}
                        <a
                            href={alt.vendorPricingUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="text-[#2563EB] hover:underline"
                        >
                            {alt.competitor} pricing
                        </a>{' '}
                        for the current figures. NapCRM pricing is on our{' '}
                        <Link to="/napcrm/pricing" className="text-[#2563EB] hover:underline">pricing page</Link>
                        {starter ? `, from ₹${starter.price.monthly.INR.toLocaleString('en-IN')}/month` : ''}.
                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-5">
                        Where {alt.competitor} is the better choice
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-12">{alt.theirStrengths}</p>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-5">
                        Who should switch
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-3">Switch if:</p>
                    <ul className="space-y-2 mb-6">
                        {alt.switchIf.map((item) => (
                            <li key={item} className="text-slate-600 leading-relaxed">{item}</li>
                        ))}
                    </ul>
                    <p className="text-slate-600 leading-relaxed mb-12">
                        <strong>Do not switch if:</strong> {alt.dontSwitch}
                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-5">
                        What migrating involves
                    </h2>
                    <ol className="space-y-3 mb-12">
                        {alt.migration.map((step) => (
                            <li key={step} className="text-slate-600 leading-relaxed">{step}</li>
                        ))}
                    </ol>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-5">
                        Other comparisons
                    </h2>
                    <ul className="not-prose flex flex-wrap gap-3 mb-12">
                        {Object.values(ALTERNATIVES)
                            .filter((other) => other.slug !== alt.slug)
                            .map((other) => (
                                <li key={other.slug}>
                                    <Link
                                        to={`/alternatives/${other.slug}`}
                                        className="inline-block px-4 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-[#2563EB]/40 hover:text-[#2563EB] transition-colors"
                                    >
                                        NapCRM vs {other.competitor}
                                    </Link>
                                </li>
                            ))}
                        <li>
                            <Link
                                to="/blog/cost-of-custom-crm-2026"
                                className="inline-block px-4 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:border-[#2563EB]/40 hover:text-[#2563EB] transition-colors"
                            >
                                Build vs buy: what a custom CRM costs
                            </Link>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="py-16 bg-slate-900 text-white">
                <div className="container-custom max-w-3xl text-center">
                    <h2 className="text-2xl md:text-4xl font-bold mb-5">
                        Talk to us about moving from {alt.competitor}
                    </h2>
                    <p className="text-slate-300 mb-8 leading-relaxed">
                        NapCRM has no self-serve signup — every plan starts with a conversation. That
                        is a real difference from {alt.competitor}, and it also means onboarding maps
                        your existing data onto an industry template rather than handing you an empty
                        dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to={`/contact?intent=switch-${alt.slug}`}
                            className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-[#F8FAFC] transition-colors"
                        >
                            Book a migration call
                        </Link>
                        <Link
                            to="/napcrm/pricing"
                            className="px-8 py-4 border border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                        >
                            See NapCRM pricing
                        </Link>
                    </div>
                </div>
            </section>

            <BackToTop />
        </div>
    );
}
