import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import FadeIn from '../components/ui/FadeIn';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackToTop from '../components/ui/BackToTop';
import ReadingProgress from '../components/ui/ReadingProgress';
import { SITE_URL } from '../constants/siteConfig';
import { withBrandKeywords } from '../constants/seoConfig';
import { COMPANY_STATS } from '../constants/companyStats';
import { PORTFOLIO_FALLBACK, ACCENT_GRADIENTS } from '../constants/portfolioFallback';
import { portfolioAPI } from '../services/api';
import { RiArrowRightLine, RiArrowUpLine } from 'react-icons/ri';

const FADE_IN_SMOOTH = { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] };

const slugify = (str) => String(str).toLowerCase().replace(/—/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// The API response is snake→camel mapped by the axios interceptor, so DB
// `tech_stack` arrives as `techStack`, `image_url` as `imageUrl`, etc.
const normalize = (p) => ({
    id: p.id,
    title: p.title,
    category: p.category || 'Web Platform',
    description: p.description || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    accent: p.accent || 'default',
    size: p.size || 'small',
    metric: p.metric || null,
    image: p.imageUrl || p.image || null,
});

const ProjectCard = ({ project }) => {
    const gradient = ACCENT_GRADIENTS[project.accent] || ACCENT_GRADIENTS.default;
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className={cn(
                'group relative rounded-[2rem] overflow-hidden h-full',
                project.size === 'large' ? 'md:col-span-2 md:row-span-2' :
                    project.size === 'wide' ? 'md:col-span-2' : 'md:col-span-1'
            )}
        >
            {/* Art-directed backdrop: real screenshot if present, else brand gradient */}
            {project.image ? (
                <img src={project.image} alt={project.title} loading="lazy"
                     className="absolute inset-0 w-full h-full object-cover" />
            ) : (
                <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)}>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
                    <span className="absolute -bottom-6 right-4 text-[9rem] font-black text-white/10 leading-none select-none">
                        {project.title.charAt(0)}
                    </span>
                </div>
            )}

            {project.metric && (
                <div className="absolute top-4 right-4 z-30">
                    <div className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <RiArrowUpLine />
                        {project.metric}
                    </div>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 flex flex-col justify-end p-8">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-200 line-clamp-3">{project.description}</p>
                </div>
            </div>
        </motion.div>
    );
};

const PortfolioPage = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [projects, setProjects] = useState(PORTFOLIO_FALLBACK);

    useEffect(() => {
        let cancelled = false;
        portfolioAPI.getAll()
            .then((res) => {
                const list = res?.data?.projects;
                if (!cancelled && Array.isArray(list) && list.length) {
                    setProjects(list.map(normalize));
                }
            })
            .catch(() => { /* keep fallback */ });
        return () => { cancelled = true; };
    }, []);

    const filters = useMemo(
        () => ['All', ...Array.from(new Set(projects.map((p) => p.category)))],
        [projects]
    );

    const filteredProjects = activeFilter === 'All'
        ? projects
        : projects.filter((p) => p.category === activeFilter);

    const stats = [
        { value: COMPANY_STATS.projects, label: 'Projects Delivered' },
        { value: COMPANY_STATS.successRate, label: 'Client Satisfaction' },
        { value: COMPANY_STATS.countries, label: 'Countries Served' },
        { value: COMPANY_STATS.years, label: 'Years Experience' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
            <Helmet>
                <title>Portfolio - Software & CRM Case Studies | Napnix</title>
                <meta name="description" content="Explore Napnix's portfolio: fleet booking apps, telecalling CRMs, AI meeting tools, HR dashboards, and multi-tenant NapCRM deployments for manufacturing and legal teams." />
                <meta name="keywords" content={withBrandKeywords('software portfolio, case studies, mobile app development, CRM deployment, AI automation, telecalling CRM, fleet management app')} />
                <link rel="canonical" href={`${SITE_URL}/portfolio`} />
                <meta property="og:title" content="Portfolio - Software & CRM Case Studies | Napnix" />
                <meta property="og:description" content="Real products we've shipped across mobile, web, AI, and CRM." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${SITE_URL}/portfolio`} />
                <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Portfolio - Software & CRM Case Studies | Napnix" />
                <meta name="twitter:description" content="Real products we've shipped across mobile, web, AI, and CRM." />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <meta property="og:site_name" content="Napnix" />
                <meta property="og:locale" content="en_IN" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:site" content="@napnix" />
                <meta name="twitter:creator" content="@napnix" />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'ItemList',
                    name: 'Napnix Portfolio',
                    url: `${SITE_URL}/portfolio`,
                    description: 'Products Napnix has designed and shipped across mobile, web, AI, and CRM.',
                    numberOfItems: projects.length,
                    itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title })),
                })}</script>
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                        { '@type': 'ListItem', position: 2, name: 'Portfolio', item: `${SITE_URL}/portfolio` },
                    ],
                })}</script>
            </Helmet>

            <ReadingProgress />

            {/* Hero */}
            <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden bg-gray-950 text-white">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-slate-900/30 to-transparent"></div>

                <div className="container-custom relative z-10">
                    <FadeIn {...FADE_IN_SMOOTH}>
                        <span className="inline-block py-2 px-4 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium mb-6">
                            Selected Work
                        </span>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-8">
                            We Ship <br />
                            <span className="text-[#D97706]">Real Products.</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mb-8">
                            A focused set of products we've designed, built, and put into production — across mobile, web, AI, and CRM.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Stats */}
            <section className="relative -mt-16 z-30 px-6 mb-12">
                <div className="container-custom">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Filter & Grid */}
            <section className="py-10 bg-[#F8FAFC] min-h-screen">
                <div className="container-custom">
                    <div className="mb-8">
                        <Breadcrumbs />
                    </div>

                    <div className="flex flex-wrap gap-4 mb-16 justify-center md:justify-start">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    'px-6 py-3 rounded-full text-sm font-bold transition-all duration-300',
                                    activeFilter === filter
                                        ? 'bg-slate-900 text-white shadow-lg scale-105'
                                        : 'bg-white text-slate-600 hover:bg-gray-100 border border-slate-200'
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[400px]">
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => (
                                <ProjectCard key={project.id ?? slugify(project.title)} project={project} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 bg-white text-center relative overflow-hidden">
                <div className="container-custom relative z-10">
                    <FadeIn {...FADE_IN_SMOOTH}>
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">Have a vision?</h2>
                        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
                            Let's collaborate to turn your boldest ideas into reality. We are ready when you are.
                        </p>
                        <Link to="/contact" className="inline-flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-full text-xl font-bold hover:bg-[#2563EB] transition-all duration-300 group shadow-2xl">
                            Start a Project
                            <RiArrowRightLine className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </FadeIn>
                </div>
            </section>

            <BackToTop />
        </div>
    );
};

export default PortfolioPage;
