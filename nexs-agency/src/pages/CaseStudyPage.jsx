import { useState, useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FadeIn from '../components/ui/FadeIn';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackToTop from '../components/ui/BackToTop';
import ReadingProgress from '../components/ui/ReadingProgress';
import { SITE_URL } from '../constants/siteConfig';
import { withBrandKeywords } from '../constants/seoConfig';
import { ACCENT_GRADIENTS } from '../constants/portfolioFallback';
import { CASE_STUDIES } from '../constants/caseStudies';
import { caseStudiesAPI } from '../services/api';
import { RiArrowRightLine, RiCheckLine, RiCloseLine, RiArrowRightSLine, RiDoubleQuotesL } from 'react-icons/ri';

const Section = ({ eyebrow, title, children }) => (
    <section className="py-14 border-t border-slate-100">
        <div className="container-custom max-w-4xl">
            {eyebrow && <span className="font-bold tracking-wider uppercase text-sm text-[#2563EB] mb-3 block">{eyebrow}</span>}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">{title}</h2>
            {children}
        </div>
    </section>
);

const CaseStudyPage = () => {
    const { slug } = useParams();
    const fallback = CASE_STUDIES[slug] || null;
    // Render the built-in copy instantly (good for SEO); refine from the API.
    const [cs, setCs] = useState(fallback);
    const [loading, setLoading] = useState(!fallback);

    useEffect(() => {
        let active = true;
        const next = CASE_STUDIES[slug] || null;
        setCs(next);
        setLoading(!next);
        caseStudiesAPI.getBySlug(slug)
            .then((res) => {
                if (active && res?.caseStudy) setCs(res.caseStudy);
            })
            .catch(() => { /* keep fallback */ })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2563EB]" />
            </div>
        );
    }

    // Unknown slug (no fallback and none from the API) → back to the portfolio grid.
    if (!cs) return <Navigate to="/portfolio" replace />;

    const gradient = ACCENT_GRADIENTS[cs.accent] || ACCENT_GRADIENTS.default;

    const caseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${cs.title} — Case Study`,
        description: cs.summary,
        url: `${SITE_URL}/portfolio/${cs.slug}`,
        publisher: { '@type': 'Organization', name: 'Napnix', url: SITE_URL },
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
            <Helmet>
                <title>{cs.title} — Case Study | Napnix</title>
                <meta name="description" content={cs.summary} />
                <meta name="keywords" content={withBrandKeywords(`${cs.title} case study, ${cs.category}, CRM implementation, custom software case study`)} />
                <link rel="canonical" href={`${SITE_URL}/portfolio/${cs.slug}`} />
                <meta property="og:title" content={`${cs.title} — Case Study | Napnix`} />
                <meta property="og:description" content={cs.summary} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`${SITE_URL}/portfolio/${cs.slug}`} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <script type="application/ld+json">{JSON.stringify(caseSchema)}</script>
            </Helmet>

            <ReadingProgress />

            {/* Hero */}
            <section className={`relative pt-28 pb-20 overflow-hidden bg-gradient-to-br ${gradient} text-white`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 mix-blend-overlay" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="container-custom relative z-10 max-w-4xl">
                    <FadeIn duration={0.6}>
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-sm font-medium mb-6">
                            {cs.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{cs.title}</h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">{cs.summary}</p>
                        <div className="flex flex-wrap gap-2">
                            {cs.tech.map((t) => (
                                <span key={t} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium">{t}</span>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </section>

            <div className="container-custom max-w-4xl pt-8">
                <Breadcrumbs />
            </div>

            {/* Problem */}
            <Section eyebrow="The Problem" title="What was breaking">
                <ul className="space-y-4">
                    {cs.problem.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg text-slate-700">
                            <RiCloseLine className="mt-1 text-rose-500 text-2xl flex-shrink-0" />
                            <span>{p}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            {/* Solution */}
            <Section eyebrow="The Solution" title="What Napnix built">
                <ul className="space-y-4">
                    {cs.solution.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg text-slate-700">
                            <RiCheckLine className="mt-1 text-[#2563EB] text-2xl flex-shrink-0" />
                            <span>{s}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            {/* System flow */}
            <Section eyebrow="System Flow" title="How it works now">
                <div className="flex flex-wrap items-center gap-3">
                    {cs.systemFlow.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium">{step}</div>
                            {i < cs.systemFlow.length - 1 && <RiArrowRightSLine className="text-slate-400 text-2xl" />}
                        </div>
                    ))}
                </div>
            </Section>

            {/* Impact */}
            <Section eyebrow="Business Impact" title="What changed">
                <div className="grid md:grid-cols-3 gap-5">
                    {cs.impact.map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white">
                            <RiCheckLine className="text-[#2563EB] text-2xl mb-3" />
                            <p className="text-slate-700">{item}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Quote */}
            <section className="py-16 bg-slate-950 text-white">
                <div className="container-custom max-w-4xl">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 bg-gradient-to-br ${gradient}`}>
                        <RiDoubleQuotesL />
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-6">&ldquo;{cs.quote.text}&rdquo;</blockquote>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold">{cs.quote.author}</span>
                        <span className="text-slate-400">{cs.quote.role}</span>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-white text-center">
                <div className="container-custom max-w-3xl">
                    <FadeIn duration={0.6}>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Losing leads to slow follow-up?</h2>
                        <p className="text-lg text-slate-500 mb-10">Book a free Revenue-Leak Audit and see where your enquiries are slipping — and how to fix it.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/contact?intent=audit" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2563EB] text-white rounded-xl text-lg font-bold hover:bg-[#1D4ED8] transition-colors shadow-xl">
                                Book a Revenue-Leak Audit
                                <RiArrowRightLine />
                            </Link>
                            <Link to="/portfolio" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-colors">
                                See more work
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </section>

            <BackToTop />
        </div>
    );
};

export default CaseStudyPage;
