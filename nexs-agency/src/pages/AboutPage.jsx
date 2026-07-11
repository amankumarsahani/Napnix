import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

// Import Assets
import officeImg from '../assets/office_collaboration.jpg';

// Import Components
import Timeline from '../components/Timeline';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import BackToTop from '../components/ui/BackToTop';
import TrustBadges from '../components/ui/TrustBadges';
import FadeIn from '../components/ui/FadeIn';
import ReadingProgress from '../components/ui/ReadingProgress';
import { SITE_URL, LOGO_URL, siteConfig } from '../constants/siteConfig';
import { withBrandKeywords } from '../constants/seoConfig';
import Icon from '../components/ui/Icon';
import { COMPANY_STATS } from '../constants/companyStats';
import { RiArrowRightLine } from 'react-icons/ri';

const FADE_IN_SMOOTH = { duration: 0.7, y: 30, ease: [0.21, 0.47, 0.32, 0.98] };

const aboutColorMap = {
  blue: { bg50: 'bg-blue-50', text600: 'text-blue-600' },
  purple: { bg50: 'bg-purple-50', text600: 'text-purple-600' },
  emerald: { bg50: 'bg-emerald-50', text600: 'text-emerald-600' },
  pink: { bg50: 'bg-pink-50', text600: 'text-pink-600' },
};

const AboutPage = () => {


  const stats = [
    { label: "Years of Innovation", value: "5+" },
    { label: "Projects Delivered", value: COMPANY_STATS.projects },
    { label: "Global Clients", value: COMPANY_STATS.clients },
    { label: "Client Retention", value: COMPANY_STATS.successRate }
  ];

  const values = [
    {
      title: "Innovation First",
      description: "We don't just follow trends; we set them. Our labs are constantly exploring AI, Blockchain, and Cloud advancements.",
      icon: "ri-lightbulb-flash-line",
      color: "blue"
    },
    {
      title: "Client Obsession",
      description: "Your growth is our north star. We build long-term partnerships, not just software.",
      icon: "ri-user-heart-line",
      color: "purple"
    },
    {
      title: "Engineering Excellence",
      description: "Spaghetti code has no place here. We write clean, scalable, and maintainable code.",
      icon: "ri-code-s-slash-line",
      color: "emerald"
    },
    {
      title: "Design Mastery",
      description: "We craft interfaces that are not only beautiful but also intuitive and accessible.",
      icon: "ri-pencil-ruler-2-line",
      color: "pink"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-600 selection:text-white overflow-hidden">
      <Helmet>
        <title>About Napnix — CRM & Lead Follow-Up Systems for Service Businesses</title>
        <meta name="description" content="Napnix helps service businesses fix lead capture, follow-up, CRM, and operations systems. Founded in 2020, based in Mohali, serving clients globally." />
        <meta name="keywords" content={withBrandKeywords('about napnix, crm agency, lead follow up systems, revenue leak audit, software company india')} />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <meta property="og:title" content="About Napnix — CRM & Lead Follow-Up Systems for Service Businesses" />
        <meta property="og:description" content="We help service businesses fix lead capture, follow-up, CRM, and operations systems." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/about`} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Napnix" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Napnix — CRM & Lead Follow-Up Systems for Service Businesses" />
        <meta name="twitter:description" content="We help service businesses fix lead capture, follow-up, CRM, and operations systems." />
        <meta name="twitter:site" content="@napnix" />
        <meta name="twitter:creator" content="@napnix" />
        <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Napnix",
            "url": SITE_URL,
            "logo": LOGO_URL,
            "description": "Napnix helps service businesses fix lead capture, follow-up, CRM, and operations systems.",
            "email": siteConfig.email.info,
            "telephone": "+916239396615, +917009108646",
            "foundingDate": "2020",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mohali",
                "addressRegion": "Punjab",
                "addressCountry": "IN"
            },
            "numberOfEmployees": {
                "@type": "QuantitativeValue",
                "minValue": 10,
                "maxValue": 50
            },
            "sameAs": siteConfig.socialUrls
        })}</script>
      </Helmet>
      <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
              { "@type": "ListItem", "position": 2, "name": "About", "item": `${SITE_URL}/about` }
          ]
      })}</script>

      {/* Scroll Progress Bar */}
      <ReadingProgress />

      {/* Hero Section - Consistent 3D Gradient Mesh */}
      <section className="relative min-h-[80vh] flex items-center pt-20 overflow-hidden bg-gray-950 text-white">
        {/* CSS-based Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&fm=webp')] bg-cover bg-center opacity-30 mix-blend-soft-light"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block py-2 px-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-300 font-medium mb-8">
              Who We Are
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-8">
              Architects of the <br />
              <span className="text-[#D97706]">Digital Future.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Napnix is more than an agency. We are a collective of dreamers, doers, and creators dedicated to building software that matters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((stat, i) => (
              <FadeIn {...FADE_IN_SMOOTH} key={i} delay={i * 0.1}>
                <div className="text-4xl md:text-5xl font-bold text-[#2563EB] mb-2">{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-widest font-medium">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section - Standard Grid Layout */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn {...FADE_IN_SMOOTH} className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 opacity-10"></div>
              <img
                src={officeImg}
                alt="Our Team Collaborating"
                loading="lazy"
                height={500}
                className="relative rounded-[3rem] shadow-2xl object-cover h-[500px] w-full"
              />
            </FadeIn>

            <div className="space-y-12">
              <FadeIn {...FADE_IN_SMOOTH}>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">The Origin Story</h2>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Founded in 2020, Napnix began as a collective of passionate engineers and designers tired of the status quo. We saw a gap in the market for a development partner that truly understood both the <strong>technical</strong> and <strong>business</strong> aspects of building digital products.
                </p>
              </FadeIn>

              <FadeIn {...FADE_IN_SMOOTH} delay={0.2}>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  To empower businesses with cutting-edge technology that drives growth, efficiency, and innovation. We believe in building software that is not only functional but also delightful to use.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <Timeline />

      {/* Values - Grid Layout */}
      <section className="py-32 bg-[#F8FAFC] relative">
        <div className="container-custom">
          <FadeIn {...FADE_IN_SMOOTH} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Our Core Values</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              The principles that guide every line of code we write and every pixel we design.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, i) => (
              <FadeIn {...FADE_IN_SMOOTH} key={i} delay={i * 0.1} className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 group">
                <div className={`w-16 h-16 rounded-2xl ${aboutColorMap[value.color]?.bg50 || 'bg-blue-50'} flex items-center justify-center text-3xl ${aboutColorMap[value.color]?.text600 || 'text-blue-600'} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon name={value.icon} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{value.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-t border-slate-200">
        <TrustBadges />
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="container-custom relative z-10">
          <FadeIn {...FADE_IN_SMOOTH}>
            <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-tighter">Ready to innovate?</h2>
            <Link to="/contact" className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black rounded-full text-xl font-bold hover:bg-[#2563EB] hover:text-white transition-all duration-300 group">
              Let's Talk
              <RiArrowRightLine className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
};

export default AboutPage;

