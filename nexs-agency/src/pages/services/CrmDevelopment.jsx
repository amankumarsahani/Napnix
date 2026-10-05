import ServicePageTemplate from '../../components/ServicePageTemplate';

/**
 * `/services/crm-development` — the pillar for the custom-CRM cluster.
 *
 * Why this page exists: the clustering analysis found this was the single
 * largest content gap on the site. "custom CRM development" and "custom crm
 * development company" return *service* pages in the SERP, and the site had
 * none — the closest asset was /blog/cost-of-custom-crm-2026, which is a cost
 * guide and returns a completely disjoint SERP (0 shared URLs with the service
 * query). A good blog post cannot rank for a service query however well it is
 * written, because it is the wrong page type.
 *
 * It is also the commercially strongest cluster on the site: NapCRM is the
 * product, 14 industry editions are the spokes, and the three /alternatives/*
 * comparisons are the mid-funnel. This page is what they all point at.
 */
const data = {
    themeColor: 'blue',
    badge: { icon: 'ri-contacts-book-line', label: 'CRM Engineering' },
    hero: {
        h1Line1: 'Custom CRM',
        h1Line2: 'Development.',
        gradient: 'from-[#2563EB] to-[#1D4ED8]',
        paragraph: 'A CRM shaped around how your business actually works — or a configured NapCRM edition if that gets you there faster. We will tell you which one fits before you commit to either.',
        ctaText: 'Scope a CRM project',
        bgImage: 'https://images.unsplash.com/photo-1552581234-26160f608093?q=60&w=1280&auto=format&fit=crop&fm=webp',
        bgImageAlt: 'Two colleagues reviewing a sales pipeline on a laptop',
    },
    overview: {
        h2: 'Build it, or configure it. <br /> Not every business needs a build.',
        paragraph: "Most CRM projects fail for the same two reasons: the tool did not match the process, or it matched perfectly and nobody used it. We start from the process and the people, decide honestly whether a configured product covers it, and only build when building is the cheaper answer over three years.",
        checklist: [
            'Lead capture and multi-channel follow-up',
            'Pipelines and stages that match your real workflow',
            'Quoting, invoicing and GST-aware billing',
            'Role-based access and client portals',
        ],
        bento: {
            largeImage: {
                src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=60&w=1280&auto=format&fit=crop&fm=webp',
                alt: 'Reporting dashboard showing pipeline stages',
                label: 'Pipeline visibility',
            },
            smallImage: {
                src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=60&w=1280&auto=format&fit=crop&fm=webp',
                alt: 'Team working through a customer handover',
            },
            stat: { value: '14', label: 'NapCRM industry editions' },
        },
    },
    capabilities: [
        {
            title: 'Lead capture and routing',
            description: 'Every enquiry lands in one pipeline with an owner, whether it arrives from a form, a call, WhatsApp or a marketplace.',
            tech: ['Web forms', 'WhatsApp Business API', 'Email parsing', 'Webhooks'],
            icon: 'ri-inbox-line',
            color: 'blue',
        },
        {
            title: 'Follow-up automation',
            description: 'Sequences, reminders and escalation rules so an enquiry cannot go quiet without someone being told.',
            tech: ['Scheduled jobs', 'Templates', 'SLA timers', 'Escalation rules'],
            icon: 'ri-repeat-line',
            color: 'purple',
        },
        {
            title: 'Quoting and invoicing',
            description: 'Quotes, invoices and payment status inside the CRM, with GST handled per HSN code rather than bolted on later.',
            tech: ['GST / HSN', 'e-invoicing', 'Razorpay / PayU', 'Tally export'],
            icon: 'ri-receipt-line',
            color: 'emerald',
        },
        {
            title: 'Integration and migration',
            description: 'Your accounting, ERP and telephony connected, and your existing records brought across rather than retyped.',
            tech: ['REST APIs', 'CSV migration', 'Zoho Books / Tally', 'Telephony'],
            icon: 'ri-links-line',
            color: 'cyan',
        },
    ],
    capabilitiesSection: { label: 'What a CRM has to do', title: 'The parts that decide whether it gets used' },
    engagement: {
        h2: 'How a CRM project runs',
        intro: "CRM work goes wrong at two specific moments: when scope is agreed without watching the actual process, and when the system goes live without anyone being trained on it. The sequence below is built around those two risks.",
        phases: [
            {
                title: 'Watch the process, 1 to 2 weeks',
                body: 'We sit with the people who will use it and follow a real enquiry from first contact to invoice. This is also where we decide build versus configure, because the honest answer usually becomes obvious in that first week. You leave with a written process map and a recommendation either way.',
            },
            {
                title: 'Decide: configure NapCRM or build custom',
                body: 'If your process is close to one of the 14 NapCRM industry editions, configuring it is faster and far cheaper, and we will say so. A build earns its cost when the process is genuinely yours, when per-seat licensing outgrows a one-off cost, or when you need to own the data model outright.',
            },
            {
                title: 'Data model and migration plan',
                body: 'We design the schema and decide what comes across from the spreadsheets, the old CRM or the registers — and what is deliberately left behind. Migrating dirty data into a clean system is the most common way a CRM loses the team’s trust in week one.',
            },
            {
                title: 'Build in two-week increments',
                body: 'Work ships to a staging URL every fortnight with a short demo, so you are using the pipeline while it is being built rather than reviewing screenshots. Scope problems surface while they are still cheap to fix.',
            },
            {
                title: 'Training, then go-live',
                body: 'We train the people who will use it daily, on their own data, before cutover. Budget two to four weeks of someone internal owning this. Projects that skip it ship on time and get abandoned within a quarter, which is the single most expensive outcome available.',
            },
        ],
        questions: [
            {
                q: 'How much does custom CRM development cost?',
                a: 'A focused single-team CRM is typically ₹4,00,000 to ₹12,00,000. A mid-market build with integrations and multiple roles runs ₹12,00,000 to ₹40,00,000. A multi-tenant platform is ₹40,00,000 and up. If a configured NapCRM edition fits instead, it starts at ₹4,165 per month. The variable that moves a build estimate most is the number of distinct user roles, because each one multiplies both the permission logic and the testing surface.',
            },
            {
                q: 'Should we build a CRM or buy one?',
                a: 'Buy when your process is close to an industry standard — you are then paying someone else to maintain it, which is a good deal. Build when the process is what differentiates you, when per-seat licensing on a large team outgrows a one-off build, or when you need to own the data model. Our cost guide works the arithmetic through with a five-year comparison, and the crossover is usually decided by seat count rather than by sophistication.',
            },
            {
                q: 'Can you migrate us off HubSpot, Zoho or Salesforce?',
                a: 'Yes, and we publish what each migration actually involves rather than claiming it is seamless. Contacts, deals and activities export cleanly from all three. What does not come across is automations, custom functions and historical engagement data — those get rebuilt or archived, and that assessment happens before you commit rather than after.',
            },
            {
                q: 'Who owns the system afterwards?',
                a: 'You do. For a custom build the repository sits in your organisation and the infrastructure runs in your own cloud account, with documentation and a runbook at handover. No proprietary runtime, and no retainer required to keep it running. For NapCRM your data is yours and exportable at any time.',
            },
            {
                q: 'How long before the team is actually using it?',
                a: 'A configured NapCRM edition can be live the same week. A focused custom build is typically 8 to 14 weeks to first release. In both cases the useful date is not go-live but the day the team stops keeping a parallel spreadsheet — which is a training question more than an engineering one.',
            },
        ],
    },
    bottomSection: { title: 'More Solutions', currentService: 'CRM Development' },
    cta: {
        h2: 'Start with the process, not the software',
        paragraph: "Book a scoping call and we will map where enquiries are being lost first. If a configured CRM fixes it, we will say so.",
        buttonText: 'Scope a CRM project',
    },
    seo: {
        title: 'Custom CRM Development Company | Napnix',
        description: 'Custom CRM development for service businesses: lead capture, follow-up automation, GST invoicing and migration from HubSpot, Zoho or Salesforce. Mohali-based.',
        keywords: 'custom CRM development, custom CRM development company, CRM development services India, bespoke CRM software, CRM development Mohali, CRM migration, build vs buy CRM',
        canonicalPath: '/services/crm-development',
        ogTitle: 'Custom CRM Development Company | Napnix',
        ogDescription: 'Custom CRM development for service businesses — or a configured NapCRM edition if that fits better. We will tell you which.',
        twitterTitle: 'Custom CRM Development Company | Napnix',
        twitterDescription: 'Custom CRM development for service businesses — or a configured NapCRM edition if that fits better.',
    },
    schema: {
        name: 'Custom CRM Development',
        description: 'Custom CRM design, development, migration and integration for service businesses, including configured NapCRM industry editions.',
    },
};

export default function CrmDevelopment() {
    return <ServicePageTemplate data={data} />;
}
