/**
 * NapCRM-vs-competitor comparison pages.
 *
 * Why these exist: the SXO analysis found a page-type mismatch on 7 of 9 target
 * queries. Searches like "hubspot alternative" and "zoho crm alternative" return
 * comparison pages, and the site published only product and service pages — so
 * there was no ranking-eligible asset for that whole intent class, however good
 * the NapCRM page was. Content was drafted in content/competitors/ (three
 * markdown files plus _competitor-data.yaml) and never shipped; this is that
 * work turned into real routes.
 *
 * Rules this file follows, and should keep following:
 *
 * 1. NapCRM figures come from crmPricing.js. They are not retyped here —
 *    PRICE_NOTE below points at the single source, and any tier number quoted
 *    in prose must match it.
 * 2. Competitor prices are public list prices, approximate, and carry a
 *    `verifiedOn` date plus a link to the vendor's own pricing page so a reader
 *    can check rather than take our word. They change tier structure
 *    periodically. Re-check before editing, and move `verifiedOn` only when
 *    actually re-checked.
 * 3. Every page states where the competitor is genuinely better (`theirStrengths`)
 *    and who should NOT switch (`dontSwitch`). A comparison page that only
 *    flatters us is both less useful and less credible, and these read as
 *    marketing the moment they stop being even-handed.
 * 4. NapCRM's own gaps are named: no self-serve signup, no import wizard, no app
 *    marketplace, shallower marketing tooling. Those are real and a buyer finds
 *    them out anyway.
 */

/** Competitor list prices were last checked against the vendors' own pages on this date. */
export const COMPETITOR_PRICING_VERIFIED_ON = '2026-08-28';

export const ALTERNATIVES = {
    hubspot: {
        slug: 'hubspot',
        competitor: 'HubSpot',
        vendorPricingUrl: 'https://www.hubspot.com/pricing',
        title: 'NapCRM — HubSpot Alternative for Service Businesses',
        description:
            "Outgrown HubSpot's free tier or hit sticker shock at Professional? NapCRM gives service businesses an industry-ready CRM without the per-contact pricing spiral.",
        h1: 'A HubSpot alternative for service businesses',
        intro:
            "HubSpot's free CRM is a genuinely good on-ramp, which is exactly why the jump hurts. Teams settle in, the contact list grows, and the cost of moving up to Sales Hub Professional lands right when they are trying to prove ROI rather than defend a bigger software line.",
        whyLook: [
            'Cost steps up sharply once seats and contact tiers stack, and the step is hard to predict from the free tier.',
            "The CRM object model is generic by design — it does not know whether you sell real estate, run a salon or manage legal cases. You build that structure yourself with custom properties and pipelines, every time.",
        ],
        summary:
            'NapCRM publishes a flat rate per tier and ships 14 industry templates with the pipelines, fields and workflows already shaped for a vertical — so the implementation time that turns a generic object model into your workflow is not on your side of the deal.',
        comparison: [
            ['Entry price', 'From ₹4,165/mo ($49), published', 'Free CRM; Sales Hub Professional costs considerably more at scale'],
            ['Industry templates', '14 built-in verticals', 'None — generic, you build it'],
            ['Pricing model', 'Flat per tier, limits published up front', 'Free tier, then per seat plus contact tiers'],
            ['Marketing automation', 'Basic: landing pages and WhatsApp from Growth up', 'Deep: forms, sequences, content, SEO tooling'],
            ['App marketplace', 'None', 'Large and mature'],
            ['E-commerce', 'Built into the CRM', 'Not native — separate tooling'],
            ['Self-serve signup', 'No — every plan starts with a conversation', 'Yes, including a free tier'],
            ['Data isolation', 'Dedicated database per tenant', 'Shared multi-tenant'],
            ['Custom development', 'Direct from the vendor — Napnix is a software agency', 'Via partner network'],
        ],
        theirStrengths:
            "If inbound marketing content, SEO tooling and email sequencing are the core of the job, HubSpot's marketing depth is real and mature. NapCRM's marketing features work but are shallower: it is a CRM with marketing features, not a marketing platform with a CRM attached.",
        switchIf: [
            'You are a service business rather than primarily inbound-marketing-led.',
            "You already know your industry's workflow and would rather not rebuild it in a generic tool.",
            'Your bill jumped after a tier change and the next step up is worse.',
        ],
        dontSwitch:
            "Your team's core function is content and inbound marketing and you use HubSpot's blogging, SEO and sequencing tools daily. NapCRM will not replace that layer, and we would rather say so now.",
        migration: [
            'Export contacts and deals from HubSpot — it has a native CSV export.',
            'Map them onto the relevant NapCRM industry template. Napnix onboarding does this mapping with you, because there is no self-serve import wizard yet. That is a real gap against HubSpot’s guided import.',
            'Historical email and engagement data does not migrate. Plan to archive it in HubSpot or export it separately if you need it for records.',
        ],
    },

    'zoho-crm': {
        slug: 'zoho-crm',
        competitor: 'Zoho CRM',
        vendorPricingUrl: 'https://www.zoho.com/crm/zoho-crm-pricing.html',
        title: 'NapCRM — A Zoho CRM Alternative Built for Your Industry',
        description:
            'Tired of configuring Zoho CRM from scratch for your industry? NapCRM ships with 14 ready-made vertical templates so you skip months of setup.',
        h1: 'A Zoho CRM alternative, pre-built for your industry',
        intro:
            'Zoho CRM is inexpensive per seat and genuinely feature-dense, which makes it a reasonable default. The cost shows up later, in configuration: the flexibility that makes it fit anything means it fits nothing in particular until someone shapes it.',
        whyLook: [
            'Setup is the real expense. Modules, layouts and workflows all need building for your vertical before the tool earns its keep.',
            'The wider Zoho suite is powerful but sprawling, and support quality varies by tier.',
        ],
        summary:
            'NapCRM arrives with the vertical already modelled — 14 industry editions covering real estate, healthcare, legal, salon, hospitality, logistics, restaurant, fitness, education, travel, manufacturing, e-commerce and professional services. The configuration you would do in month one is the product.',
        comparison: [
            ['Entry price', 'From ₹4,165/mo ($49) per workspace', 'Low per-user monthly, rising by tier'],
            ['Pricing unit', 'Per workspace, with published limits', 'Per user'],
            ['Industry templates', '14 built-in verticals', 'Build it yourself from generic modules'],
            ['Time to first useful pipeline', 'Same day — the template is the starting point', 'Configuration project'],
            ['Suite breadth', 'CRM, e-commerce, invoicing, team chat, client portals', 'Very broad across the Zoho suite'],
            ['WhatsApp', 'Native from Growth tier up', 'Via integration or add-on'],
            ['India billing', 'INR billing, GST-aware invoicing, UPI-first checkout work', 'INR billing available'],
            ['Custom development', 'Direct from the vendor', 'Partner network or in-house'],
        ],
        theirStrengths:
            'Zoho is hard to beat on cost per seat for a large team, and the breadth of the surrounding suite — Books, Desk, Campaigns, Projects — is real. If you are already standardised on Zoho across the business, staying inside that ecosystem has value a point solution cannot match.',
        switchIf: [
            'You want the industry workflow to exist on day one rather than be a configuration project.',
            'Your team is small enough that per-workspace pricing beats per-seat.',
            'You want the vendor to also build the custom pieces rather than hand you to a partner.',
        ],
        dontSwitch:
            'You are committed to the Zoho suite across finance, support and marketing, or you have already invested the configuration effort and the result fits. Re-platforming a CRM that already matches your process is rarely worth it.',
        migration: [
            'Export your modules from Zoho CRM as CSV.',
            'Pick the NapCRM industry edition closest to your process; Napnix maps your fields onto it during onboarding.',
            'Automations and custom functions do not transfer — they are rebuilt as NapCRM workflows, which is scoped before you commit.',
        ],
    },

    salesforce: {
        slug: 'salesforce',
        competitor: 'Salesforce',
        vendorPricingUrl: 'https://www.salesforce.com/sales/pricing/',
        title: 'NapCRM — Salesforce Alternative, No Admin Needed',
        description:
            "No AppExchange, no dedicated admin. NapCRM gives service businesses industry-ready CRM workflows at a fraction of Salesforce's cost and complexity.",
        h1: 'A Salesforce alternative without the admin overhead',
        intro:
            'Salesforce is the most capable CRM on the market and that is not in dispute. The question is whether a service business with a few dozen staff needs that capability, and whether it can carry the cost of running it.',
        whyLook: [
            'Per-seat cost at the upper tiers is a material line item for a smaller team.',
            'It generally needs an administrator. Someone has to own objects, permissions, flows and releases, and that role is a real cost whether or not it has a title.',
            'Implementation time and cost are routinely underestimated.',
        ],
        summary:
            'NapCRM is deliberately narrower. It covers lead capture, follow-up, pipeline, invoicing, client portals and the industry specifics for 14 verticals, at a published flat rate, with no administrator required to keep it running.',
        comparison: [
            ['Entry price', 'From ₹4,165/mo ($49) per workspace', 'Per user per month, rising steeply by tier'],
            ['Administrator needed', 'No', 'In practice, yes'],
            ['Industry templates', '14 built-in verticals', 'Built by you or an implementation partner'],
            ['Extensibility', 'Custom work direct from Napnix', 'AppExchange plus a large partner ecosystem'],
            ['Implementation', 'Days, with onboarding included', 'Weeks to months, usually via a partner'],
            ['Reporting depth', 'Standard operational reporting', 'Extensive and highly configurable'],
            ['Enterprise governance', 'Basic roles and permissions', 'Comprehensive'],
            ['Best fit', 'Service businesses up to roughly mid-size', 'Complex sales organisations and enterprises'],
        ],
        theirStrengths:
            'For a complex sales organisation — multiple business units, intricate territory and approval rules, deep reporting demands, a compliance regime that needs full audit governance — Salesforce is the right tool and NapCRM is not a substitute. Its ecosystem and extensibility are genuinely unmatched.',
        switchIf: [
            'You are paying enterprise per-seat rates for a fraction of the capability.',
            'Nobody on the team actually wants to be the CRM administrator.',
            'Your process is a recognisable service-business workflow rather than a bespoke enterprise sales motion.',
        ],
        dontSwitch:
            'You need AppExchange integrations, multi-business-unit governance, territory management or the reporting depth Salesforce is built for. Those are the reasons it costs what it costs.',
        migration: [
            'Export accounts, contacts, opportunities and activities from Salesforce.',
            'Map them onto a NapCRM industry edition with Napnix during onboarding.',
            'Apex, Flows and AppExchange integrations have no equivalent and are rebuilt or dropped. That assessment happens before you commit, not after.',
        ],
    },
};

export const ALTERNATIVE_SLUGS = Object.keys(ALTERNATIVES);

/** @returns {typeof ALTERNATIVES[keyof typeof ALTERNATIVES]} */
export function getAlternative(slug) {
    const alt = ALTERNATIVES[slug];
    if (!alt) throw new Error(`Unknown alternative slug: ${slug}`);
    return alt;
}
