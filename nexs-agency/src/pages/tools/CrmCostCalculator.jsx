import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import BackToTop from '../../components/ui/BackToTop';
import { SITE_URL } from '../../constants/siteConfig';
import useCurrency from '../../hooks/useCurrency';
import {
    BUILD_SCOPES,
    ANNUAL_MAINTENANCE_RATE,
    DEFAULT_COMPETITOR_SEAT_RATE_INR,
    calculateTco,
} from '../../constants/crmCostModel';

/**
 * `/tools/crm-cost-calculator` — build vs buy, with the arithmetic shown.
 *
 * This is the linkable asset from BACKLINKS-PLAN.md §4. The reasoning for
 * choosing a cost calculator over the other candidates: it sits on the site's
 * strongest commercial cluster (the /services/crm-development pillar and the
 * cost guide), it runs entirely client-side so there is nothing to operate, and
 * "should we build or buy a CRM" is a question people ask in public — on forums,
 * in comparison posts, in founder communities — which is where a citable tool
 * picks up links.
 *
 * Three deliberate decisions, all of which exist to make it linkable rather
 * than merely useful:
 *
 * 1. NO EMAIL GATE. Gating the result behind a form converts a few visitors and
 *    destroys the reason anyone would link to it. The CTA is at the end, after
 *    the answer, and it is skippable.
 * 2. The methodology is on the page, not hidden. Every assumption, its source,
 *    and what the model ignores. A tool whose numbers cannot be checked does not
 *    get cited by anyone whose link is worth having.
 * 3. It will tell you not to build. If a subscription is cheaper over your
 *    horizon the page says so plainly, including when that means not buying from
 *    us either. An agency calculator that always recommends an agency build is
 *    recognisably worthless.
 */
export default function CrmCostCalculator() {
    const { currency, symbol, formatPrice } = useCurrency();

    const [seats, setSeats] = useState(5);
    const [years, setYears] = useState(3);
    const [scopeId, setScopeId] = useState('focused');
    const [competitorRate, setCompetitorRate] = useState(DEFAULT_COMPETITOR_SEAT_RATE_INR);
    const [billedYearly, setBilledYearly] = useState(false);

    const result = useMemo(
        () => calculateTco({
            seats, years, scopeId,
            competitorSeatRateInr: competitorRate,
            billedYearly,
        }),
        [seats, years, scopeId, competitorRate, billedYearly],
    );

    /* The model works in INR because that is the currency our own published
       prices are set in. Display converts with the same ratio the pricing page
       uses, so the two cannot disagree. */
    const toDisplay = (inr) => {
        if (inr == null) return null;
        if (currency === 'INR') return inr;
        const ratio = currency === 'USD' ? 49 / 4165 : 45 / 4165;
        return Math.round(inr * ratio);
    };
    const money = (inr) => (inr == null ? '—' : `${symbol}${formatPrice(toDisplay(inr))}`);

    const pageUrl = `${SITE_URL}/tools/crm-cost-calculator`;
    const title = 'CRM Cost Calculator: Build vs Buy | Napnix';
    const description = 'Work out whether building a custom CRM or paying per seat costs less over 3 to 5 years. Open assumptions, no email required.';

    const rows = [
        { label: 'Build custom', total: result.buildTotal,
          note: `${money(result.buildUpfront)} build + ${money(result.buildMaintenance)} maintenance over ${years} year${years === 1 ? '' : 's'}` },
        { label: result.tier ? `NapCRM ${result.tier.name}` : 'NapCRM Enterprise',
          total: result.napcrmTotal,
          note: result.tier
            ? `${money(result.napcrmMonthly)}/month, covers up to ${result.tier.limits.teamMembers} team members`
            : `${seats} seats is past the published tiers — that is a conversation, not a list price` },
        { label: 'Per-seat CRM', total: result.competitorTotal,
          note: `${money(competitorRate)}/user/month × ${seats} seat${seats === 1 ? '' : 's'}` },
    ];
    const max = Math.max(...rows.map((r) => r.total || 0), 1);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={pageUrl} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>

            <section className="pt-32 pb-10 bg-slate-900 text-white">
                <div className="container-custom max-w-4xl">
                    <Breadcrumbs />
                    <h1 className="text-3xl md:text-5xl font-bold mt-6 mb-5 leading-tight">
                        CRM cost calculator: build or buy?
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        Enter your team size and horizon. The tool compares a custom build against a
                        flat-rate CRM and a per-seat CRM, and shows the year at which building
                        becomes the cheaper option — if it ever does. Every assumption is listed
                        below the result, and nothing is gated.
                    </p>
                </div>
            </section>

            <section className="py-14">
                <div className="container-custom max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div>
                            <label htmlFor="seats" className="block text-sm font-semibold text-slate-700 mb-2">
                                People who need access: <span className="text-[#2563EB]">{seats}</span>
                            </label>
                            <input
                                id="seats" type="range" min="1" max="60" value={seats}
                                onChange={(e) => setSeats(Number(e.target.value))}
                                className="w-full accent-[#2563EB]"
                            />
                        </div>

                        <div>
                            <label htmlFor="years" className="block text-sm font-semibold text-slate-700 mb-2">
                                Time horizon: <span className="text-[#2563EB]">{years} year{years === 1 ? '' : 's'}</span>
                            </label>
                            <input
                                id="years" type="range" min="1" max="7" value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="w-full accent-[#2563EB]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="scope" className="block text-sm font-semibold text-slate-700 mb-2">
                                If you built it, what scope?
                            </label>
                            <select
                                id="scope" value={scopeId}
                                onChange={(e) => setScopeId(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                            >
                                {BUILD_SCOPES.map((s) => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                            <p className="text-sm text-slate-500 mt-2">
                                {result.scope.detail} Typical range {money(result.scope.low)}–{money(result.scope.high)},
                                about {result.scope.months}.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="rate" className="block text-sm font-semibold text-slate-700 mb-2">
                                Per-seat CRM you are comparing against ({symbol}/user/month)
                            </label>
                            <input
                                id="rate" type="number" min="100" max="20000" step="100"
                                value={competitorRate}
                                onChange={(e) => setCompetitorRate(Math.max(100, Number(e.target.value) || 100))}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                In INR. Put in the real quoted rate rather than a list price — the two
                                are rarely the same.
                            </p>
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center gap-3 text-sm text-slate-700">
                                <input
                                    type="checkbox" checked={billedYearly}
                                    onChange={(e) => setBilledYearly(e.target.checked)}
                                    className="w-4 h-4 accent-[#2563EB]"
                                />
                                Price NapCRM on annual billing
                            </label>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-5">
                        Over {years} year{years === 1 ? '' : 's'}, for {seats} {seats === 1 ? 'person' : 'people'}
                    </h2>

                    <div className="space-y-4 mb-8">
                        {rows.map((r) => (
                            <div key={r.label}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-slate-800">{r.label}</span>
                                    <span className={`font-bold ${r.label === result.cheapest ? 'text-[#2563EB]' : 'text-slate-700'}`}>
                                        {money(r.total)}
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${r.label === result.cheapest ? 'bg-[#2563EB]' : 'bg-slate-300'}`}
                                        style={{ width: `${Math.round(((r.total || 0) / max) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{r.note}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6 mb-12">
                        <p className="text-lg text-slate-800 leading-relaxed mb-0">
                            <strong>Cheapest over {years} year{years === 1 ? '' : 's'}: {result.cheapest}.</strong>{' '}
                            {result.crossoverYear
                                ? `Building overtakes the cheaper subscription in year ${result.crossoverYear}.`
                                : 'Building does not become cheaper within a ten-year horizon at this team size.'}
                            {' '}Seat count moves this more than scope does: a subscription scales with
                            people, a build mostly does not.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-4">How this is calculated</h2>
                    <ul className="space-y-3 text-slate-600 leading-relaxed mb-6">
                        <li>
                            <strong>NapCRM</strong> prices come from the same source as our{' '}
                            <Link to="/napcrm/pricing" className="text-[#2563EB] hover:underline">pricing page</Link>,
                            so they cannot drift. Tiers are per workspace, not per seat; the tool picks
                            the cheapest tier whose team-member limit covers your number.
                        </li>
                        <li>
                            <strong>Build cost</strong> uses the midpoint of the bands published in our{' '}
                            <Link to="/blog/cost-of-custom-crm-2026" className="text-[#2563EB] hover:underline">cost guide</Link>,
                            which are our own quoted figures for an Indian development team. The range
                            is shown above so a midpoint is not mistaken for a quote.
                        </li>
                        <li>
                            <strong>Maintenance</strong> is {Math.round(ANNUAL_MAINTENANCE_RATE * 100)}% of
                            the build cost per year — dependency and OS upgrades, fixes, small changes.
                            Not new features.
                        </li>
                        <li>
                            <strong>Per-seat comparison</strong> is whatever you enter. We do not
                            default to a named competitor, because their list prices change and a stale
                            comparison is worse than none.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-800 mb-4">What it deliberately ignores</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        Three costs are missing, and they matter:
                    </p>
                    <ul className="space-y-3 text-slate-600 leading-relaxed mb-6">
                        <li>
                            <strong>Your own people&rsquo;s time</strong> for migration, training and
                            administration. It lands on both options and it is heavier on a build.
                            Budget two to four weeks of someone internal either way.
                        </li>
                        <li>
                            <strong>Discounts and negotiated terms.</strong> Annual commitments and
                            enterprise rates can move a per-seat figure substantially.
                        </li>
                        <li>
                            <strong>What the system is worth.</strong> The reason to do either is
                            usually revenue that stops leaking, not software spend — and no calculator
                            can tell you what that is for your business.
                        </li>
                    </ul>
                    <p className="text-slate-600 leading-relaxed mb-12">
                        If the numbers above say subscribe, subscribe — including if that means not
                        buying a build from us. The cases where a build genuinely wins are large seat
                        counts and a process that is actually yours, and both are visible in this
                        chart.
                    </p>

                    <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-6">
                        <p className="text-slate-700 mb-3">
                            <strong>Using this tool somewhere?</strong> It is free to link to or quote —
                            no attribution required, though a link back is appreciated.
                        </p>
                        <p className="text-sm text-slate-500 mb-0 break-all">{pageUrl}</p>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-900 text-white">
                <div className="container-custom max-w-3xl text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Want the number for your actual process?</h2>
                    <p className="text-slate-300 mb-8 leading-relaxed">
                        A 20-minute call, and we will tell you which side of this chart you are on —
                        including when the answer is that you do not need us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact?intent=crm-costing" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-[#F8FAFC] transition-colors">
                            Book a scoping call
                        </Link>
                        <Link to="/services/crm-development" className="px-8 py-4 border border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                            How a CRM project runs
                        </Link>
                    </div>
                </div>
            </section>

            <BackToTop />
        </div>
    );
}
