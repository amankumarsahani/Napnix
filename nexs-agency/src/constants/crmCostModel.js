import { crmTiers } from './crmPricing';

/**
 * The cost model behind /tools/crm-cost-calculator.
 *
 * Kept in its own module, separate from the UI, for one reason: the tool is
 * only worth linking to if someone can check the arithmetic. A calculator that
 * produces a number from hidden assumptions is marketing; one that shows its
 * working is a reference. Every figure below is stated on the page itself, and
 * the page says where each came from.
 *
 * Where the numbers come from
 * ---------------------------
 * - NapCRM tier prices and seat limits: crmPricing.js, the same source the
 *   pricing page renders from. They cannot drift from what we actually charge.
 * - Build cost bands: the ranges published in /blog/cost-of-custom-crm-2026,
 *   which are our own quoted work for an Indian development team. Midpoints are
 *   used here; the page shows the band.
 * - Maintenance at 15% of build cost per year: an industry convention, and the
 *   figure that guide uses. It covers dependency and OS upgrades, bug fixes and
 *   small changes — not new features.
 * - Per-seat competitor rate: a user-supplied input, defaulted to a mid-market
 *   figure. We deliberately do NOT name a competitor in the default, because
 *   their list prices change and an out-of-date comparison is worse than none.
 *
 * What the model deliberately ignores, and the page says so:
 * - Internal staff time for migration, training and administration. It is real
 *   and it falls on both options, heavier on build.
 * - Discounts, annual-commitment terms and negotiated enterprise rates.
 * - The cost of the thing not existing — i.e. the revenue a better system
 *   earns. That is the actual reason to buy either, and no calculator can tell
 *   you what it is for your business.
 */

/** Share of the original build cost spent per year keeping it working. */
export const ANNUAL_MAINTENANCE_RATE = 0.15;

/**
 * Build cost bands in INR, from the cost guide. `mid` drives the chart; `low`
 * and `high` are shown so nobody mistakes a midpoint for a quote.
 */
export const BUILD_SCOPES = [
    {
        id: 'focused',
        label: 'Focused — one team, one pipeline',
        detail: 'A single pipeline, one user role, reporting, and email or WhatsApp follow-up.',
        low: 400000,
        mid: 800000,
        high: 1200000,
        months: '8–14 weeks',
    },
    {
        id: 'mid-market',
        label: 'Mid-market — roles and integrations',
        detail: 'Multiple roles and permissions, ERP or accounting integration, approval flows.',
        low: 1200000,
        mid: 2600000,
        high: 4000000,
        months: '4–7 months',
    },
    {
        id: 'platform',
        label: 'Multi-tenant platform',
        detail: 'Per-tenant isolation, billing, self-serve onboarding, an admin surface.',
        low: 4000000,
        mid: 6000000,
        high: 10000000,
        months: '7–14 months',
    },
];

/** Default per-seat competitor rate, in INR per user per month. */
export const DEFAULT_COMPETITOR_SEAT_RATE_INR = 2000;

/**
 * The cheapest NapCRM tier that covers `seats`, or null when the team is past
 * the published tiers and the honest answer is "that is an Enterprise
 * conversation, not a number a calculator should invent".
 */
export function tierForSeats(seats) {
    const priced = crmTiers.filter((t) => !t.isCustom && t.price.monthly.INR != null);
    const withLimits = priced
        .map((t) => ({ tier: t, limit: Number(String(t.limits.teamMembers).replace(/[^0-9]/g, '')) }))
        .filter((x) => Number.isFinite(x.limit) && x.limit > 0)
        .sort((a, b) => a.limit - b.limit);
    const hit = withLimits.find((x) => seats <= x.limit);
    return hit ? hit.tier : null;
}

/**
 * Total cost of ownership over `years`, for all three routes.
 *
 * Returns INR. The UI converts for display using the same rates as the pricing
 * page, so a figure here and a figure there cannot disagree.
 */
export function calculateTco({ seats, years, scopeId, competitorSeatRateInr, billedYearly }) {
    const scope = BUILD_SCOPES.find((s) => s.id === scopeId) || BUILD_SCOPES[0];

    const buildUpfront = scope.mid;
    const buildMaintenance = Math.round(buildUpfront * ANNUAL_MAINTENANCE_RATE * years);
    const buildTotal = buildUpfront + buildMaintenance;

    const tier = tierForSeats(seats);
    const monthly = tier
        ? (billedYearly ? tier.price.yearly.INR : tier.price.monthly.INR)
        : null;
    const napcrmTotal = monthly == null ? null : monthly * 12 * years;

    const competitorTotal = Math.round(competitorSeatRateInr * seats * 12 * years);

    /* The year at which cumulative build cost drops below the cheaper
       subscription — the only number in this tool that actually decides
       anything. null when it never does inside a 10-year horizon. */
    const annualSubscription = napcrmTotal != null
        ? napcrmTotal / years
        : competitorTotal / years;
    let crossoverYear = null;
    for (let y = 1; y <= 10; y += 1) {
        const build = buildUpfront + buildUpfront * ANNUAL_MAINTENANCE_RATE * y;
        if (build < annualSubscription * y) { crossoverYear = y; break; }
    }

    return {
        scope,
        years,
        seats,
        tier,
        buildUpfront,
        buildMaintenance,
        buildTotal,
        napcrmMonthly: monthly,
        napcrmTotal,
        competitorTotal,
        competitorSeatRateInr,
        crossoverYear,
        cheapest: [
            ['Build custom', buildTotal],
            ...(napcrmTotal != null ? [['NapCRM', napcrmTotal]] : []),
            ['Per-seat CRM', competitorTotal],
        ].sort((a, b) => a[1] - b[1])[0][0],
    };
}
