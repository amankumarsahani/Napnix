import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FadeIn from '../components/ui/FadeIn';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackToTop from '../components/ui/BackToTop';
import { SITE_URL } from '../constants/siteConfig';
import { withBrandKeywords } from '../constants/seoConfig';
import {
    RiArrowRightLine, RiCheckLine, RiCustomerService2Line,
    RiFlashlightLine, RiShieldCheckLine, RiStackLine,
} from 'react-icons/ri';

/**
 * Products catalogue. Add new products here.
 * Set `hidden: true` to keep a product in the data but off the site
 * (used to re-enable it later without rebuilding the entry).
 */
const PRODUCTS = [
    {
        slug: 'napcrm',
        name: 'NapCRM',
        tagline: 'The CRM that runs your whole operation',
        description:
            'Lead capture, sales pipeline, automated follow-up, and industry workflows in one system. Off-the-shelf when it fits, tailored when it doesn\'t — built for agencies and service businesses.',
        href: '/napcrm',
        accent: 'from-[#2563EB] to-[#7C3AED]',
        badge: 'Available now',
        features: [
            'Lead capture from forms, WhatsApp, and calls',
            'Automated follow-up so no enquiry goes cold',
            'Sales pipeline and customer database in one place',
            '14 industry-specific configurations',
        ],
        hidden: false,
    },
    {
        // Kept for a future launch. Hidden for now — do not surface on the site.
        slug: 'napmail',
        name: 'NapMail',
        tagline: '',
        description: '',
        href: '/napmail',
        accent: 'from-slate-500 to-slate-700',
        badge: '',
        features: [],
        hidden: true,
    },
];

const WHY = [
    { icon: RiStackLine, title: 'One system', desc: 'Your leads, customers, and follow-up live together — not across spreadsheets, notebooks, and phones.' },
    { icon: RiFlashlightLine, title: 'Fast to launch', desc: 'Start on a ready configuration for your industry, then tailor only what you need.' },
    { icon: RiShieldCheckLine, title: 'Yours to keep', desc: 'Your data stays isolated per business. No lock-in, no shared tenant surprises.' },
    { icon: RiCustomerService2Line, title: 'Real support', desc: 'You talk to the team that builds it. Setup help and follow-up, not a ticket queue.' },
];

export default function ProductsPage() {
    const visible = PRODUCTS.filter((p) => !p.hidden);

    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>Products — NapCRM by Napnix | CRM & Software for Service Businesses</title>
                <meta name="description" content="Explore Napnix products. NapCRM is a CRM built for agencies and service businesses — lead capture, automated follow-up, and industry workflows in one system." />
                <meta name="keywords" content={withBrandKeywords('Napnix products, NapCRM, CRM for service businesses, lead management software India')} />
                <link rel="canonical" href={`${SITE_URL}/products`} />
                <meta property="og:title" content="Products by Napnix — NapCRM" />
                <meta property="og:description" content="NapCRM: lead capture, automated follow-up, and industry workflows in one system for agencies and service businesses." />
                <meta property="og:url" content={`${SITE_URL}/products`} />
                <meta property="og:type" content="website" />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <Breadcrumbs />
            </div>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <FadeIn>
                    <div className="max-w-3xl">
                        <span className="inline-block text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-4">Products</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                            Software we build, sell, and support.
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Napnix products are the systems behind growing service businesses — starting with NapCRM.
                            Ready to use out of the box, tailored when your operation needs it.
                        </p>
                    </div>
                </FadeIn>
            </section>

            {/* Product cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="grid gap-8">
                    {visible.map((p) => (
                        <FadeIn key={p.slug}>
                            <div className="relative rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                                <div className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-[0.04]`} />
                                <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
                                    <div>
                                        {p.badge && (
                                            <span className="inline-block text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full mb-4">
                                                {p.badge}
                                            </span>
                                        )}
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{p.name}</h2>
                                        <p className="text-lg font-semibold text-[#7C3AED] mb-4">{p.tagline}</p>
                                        <p className="text-slate-600 leading-relaxed mb-6">{p.description}</p>
                                        <div className="flex flex-wrap gap-3">
                                            <Link
                                                to={p.href}
                                                className="group inline-flex items-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-bold transition-colors"
                                            >
                                                Explore {p.name}
                                                <RiArrowRightLine className="ml-2 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                            <Link
                                                to="/contact?intent=demo"
                                                className="inline-flex items-center border border-slate-300 hover:border-[#2563EB] text-slate-700 hover:text-[#2563EB] px-6 py-3 rounded-xl font-bold transition-colors"
                                            >
                                                Book a demo
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="md:border-l md:border-slate-200 md:pl-8">
                                        <ul className="space-y-3">
                                            {p.features.map((f) => (
                                                <li key={f} className="flex items-start gap-3">
                                                    <RiCheckLine className="text-[#2563EB] text-xl flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-700">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* Why our products */}
            <section className="bg-slate-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why teams choose Napnix products</h2>
                    </FadeIn>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {WHY.map((w) => (
                            <FadeIn key={w.title}>
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full">
                                    <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                                        <w.icon className="text-[#2563EB] text-2xl" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{w.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{w.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <FadeIn>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Not sure which fits?</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        Book a free Revenue-Leak Audit. We'll look at how leads reach you today and recommend the right system — NapCRM or a custom build.
                    </p>
                    <Link
                        to="/contact?intent=audit"
                        className="group inline-flex items-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
                    >
                        Book a Revenue-Leak Audit
                        <RiArrowRightLine className="ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </FadeIn>
            </section>

            <BackToTop />
        </div>
    );
}
