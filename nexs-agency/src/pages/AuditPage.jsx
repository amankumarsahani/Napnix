import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FadeIn from '../components/ui/FadeIn';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackToTop from '../components/ui/BackToTop';
import ReadingProgress from '../components/ui/ReadingProgress';
import { SITE_URL } from '../constants/siteConfig';
import { withBrandKeywords } from '../constants/seoConfig';
import {
    RiArrowRightLine, RiCheckLine, RiSearchEyeLine, RiTimerFlashLine,
    RiRepeatLine, RiDatabase2Line, RiExchangeLine, RiBarChartBoxLine,
} from 'react-icons/ri';

const CTA_HREF = '/contact?intent=audit';

// What we inspect during the audit.
const AUDIT_AREAS = [
    { icon: RiSearchEyeLine, title: 'Lead Capture', desc: 'Every place an enquiry can enter — forms, WhatsApp, calls, DMs, referrals — and where they silently drop.' },
    { icon: RiTimerFlashLine, title: 'Response Time', desc: 'How fast a new lead actually gets a human reply. Minutes vs hours decides who wins the deal.' },
    { icon: RiRepeatLine, title: 'Follow-up', desc: 'What happens after the first touch. Missed, forgotten, and un-automated follow-ups are the biggest leak.' },
    { icon: RiDatabase2Line, title: 'CRM Hygiene', desc: 'Whether your pipeline reflects reality, or lives across spreadsheets, notebooks, and someone\'s phone.' },
    { icon: RiExchangeLine, title: 'Handoffs', desc: 'Where leads stall between sales, delivery, and support because ownership is unclear.' },
    { icon: RiBarChartBoxLine, title: 'Reporting', desc: 'Whether you can see which sources bring revenue — or you\'re guessing where to spend.' },
];

// Real clients used as a proof strip (names only — no fabricated metrics).
const PROOF = ['Verma Industries', 'Prabhawati Vidya Peeth', 'Aman Singh Legal', 'Taxiologists'];

const SAMPLE_FINDINGS = [
    'Web form leads take 6+ hours for a first reply — most go cold before contact.',
    'WhatsApp enquiries have no owner and no follow-up sequence.',
    'No single pipeline — leads live in 3 places, so nothing is truly tracked.',
    'No automated reminders, so follow-ups depend on someone remembering.',
    'No source reporting — you can\'t tell which channel actually pays back.',
];

const YOU_GET = [
    'A clear map of where leads and follow-ups are leaking',
    'The 3 highest-impact fixes, ranked by effort vs return',
    'A recommended system (NapCRM or custom) with a rough scope',
    'A written summary you can share with your team',
];

const FAQS = [
    { q: 'How long does the audit take?', a: 'The call is 20–30 minutes. We review your enquiry-to-close flow live and send a short written summary afterwards.' },
    { q: 'Is it really free?', a: 'Yes. The audit is a genuine diagnostic, not a disguised sales pitch. If NapCRM or a custom build is the right fix, we\'ll say so — and if it isn\'t, we\'ll tell you that too.' },
    { q: 'Who is it for?', a: 'Agencies and service businesses that get enough enquiries but lose too many to slow or messy follow-up. Most useful if you have a team of 2–50 and no single reliable system.' },
    { q: 'What do you need from me?', a: 'A quick look at how leads currently reach you and what happens next. No prep required — we\'ll walk through it together.' },
];

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
};

const AuditPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
            <Helmet>
                <title>Revenue-Leak Audit — Find Where You're Losing Leads | Napnix</title>
                <meta name="description" content="A free 20-minute Revenue-Leak Audit for agencies and service businesses. See exactly where enquiries, follow-ups, and handoffs are breaking — and the fastest way to fix them." />
                <meta name="keywords" content={withBrandKeywords('revenue leak audit, lead follow-up audit, CRM audit, lead management for service businesses, enquiry management, sales pipeline automation')} />
                <link rel="canonical" href={`${SITE_URL}/audit`} />
                <meta property="og:title" content="Revenue-Leak Audit — Find Where You're Losing Leads | Napnix" />
                <meta property="og:description" content="Free 20-minute diagnostic: see where leads and follow-ups leak, and how to fix it fast." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${SITE_URL}/audit`} />
                <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
            </Helmet>

            <ReadingProgress />

            {/* Hero */}
            <section className="relative min-h-[80vh] flex items-center pt-24 overflow-hidden bg-gray-950 text-white">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/30 to-transparent" />
                <div className="container-custom relative z-10">
                    <FadeIn duration={0.7}>
                        <span className="inline-block py-2 px-4 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium mb-6">
                            Free · 20 minutes · No obligation
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
                            You're not short on leads.<br />
                            <span className="text-[#D97706]">You're losing them.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">
                            Most agencies and service businesses don't have a traffic problem — they have a follow-up problem. The Revenue-Leak Audit shows you exactly where enquiries, replies, and handoffs are breaking, and the fastest way to plug them.
                        </p>
                        <Link to={CTA_HREF} className="inline-flex items-center gap-3 px-8 py-4 bg-[#2563EB] text-white rounded-xl text-lg font-bold hover:bg-[#1D4ED8] transition-colors shadow-2xl">
                            Book your Revenue-Leak Audit
                            <RiArrowRightLine />
                        </Link>
                    </FadeIn>
                </div>
            </section>

            {/* Who it's for */}
            <section className="py-16 bg-[#F8FAFC]">
                <div className="container-custom">
                    <Breadcrumbs />
                    <div className="mt-8 max-w-3xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Who it's for</h2>
                        <p className="text-lg text-slate-600">
                            You get enough enquiries, but too many go cold. Leads sit in WhatsApp, forms, and inboxes with no clear owner. Follow-up depends on someone remembering. You suspect you're losing deals you already paid to attract — you just can't see where. If that's you, this audit is built for you.
                        </p>
                    </div>
                </div>
            </section>

            {/* What gets audited */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <span className="font-bold tracking-wider uppercase text-sm text-[#2563EB] mb-3 block">The Audit</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">What we look at</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AUDIT_AREAS.map(({ icon: Icon, title, desc }) => (
                            <FadeIn key={title} duration={0.5}>
                                <div className="h-full p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center text-2xl mb-5">
                                        <Icon />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sample output */}
            <section className="py-20 bg-slate-950 text-white">
                <div className="container-custom grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="font-bold tracking-wider uppercase text-sm text-[#D97706] mb-3 block">Sample output</span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">What you'll actually see</h2>
                        <p className="text-slate-300 text-lg">
                            No vague advice. You get concrete findings tied to your real flow — the kind of things quietly costing you deals every week.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">Example findings</p>
                        <ul className="space-y-4">
                            {SAMPLE_FINDINGS.map((f, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0" />
                                    <span className="text-slate-200">{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* What you get */}
            <section className="py-20 bg-white">
                <div className="container-custom max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">What you walk away with</h2>
                    <ul className="space-y-4">
                        {YOU_GET.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-lg text-slate-700">
                                <RiCheckLine className="mt-1 text-[#2563EB] text-2xl flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Proof strip */}
            <section className="py-14 bg-[#F8FAFC] border-y border-slate-200">
                <div className="container-custom text-center">
                    <p className="text-sm uppercase tracking-wider text-slate-500 mb-6">Systems we've built for teams like yours</p>
                    <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                        {PROOF.map((name) => (
                            <span key={name} className="text-lg md:text-xl font-bold text-slate-400">{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white">
                <div className="container-custom max-w-3xl">
                    <div className="text-center mb-12">
                        <span className="font-bold tracking-wider uppercase text-sm text-[#2563EB] mb-3 block">FAQ</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Questions, answered</h2>
                    </div>
                    <div className="space-y-4">
                        {FAQS.map((f) => (
                            <div key={f.q} className="p-6 rounded-2xl border border-slate-200 bg-white">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.q}</h3>
                                <p className="text-slate-600 leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-slate-950 text-center text-white">
                <div className="container-custom">
                    <FadeIn duration={0.6}>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Stop paying for leads you lose.</h2>
                        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                            Book the audit. In 20 minutes you'll know exactly where your revenue is leaking — and what to fix first.
                        </p>
                        <Link to={CTA_HREF} className="inline-flex items-center gap-3 px-10 py-5 bg-[#2563EB] text-white rounded-xl text-xl font-bold hover:bg-[#1D4ED8] transition-colors shadow-2xl">
                            Book your Revenue-Leak Audit
                            <RiArrowRightLine />
                        </Link>
                    </FadeIn>
                </div>
            </section>

            <BackToTop />
        </div>
    );
};

export default AuditPage;
