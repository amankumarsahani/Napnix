import { lazy, memo, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from './constants/siteConfig';
import { DEFAULT_SITE_KEYWORDS } from './constants/seoConfig';
import { useAuth } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import TelemetryTracker from './components/TelemetryTracker';

// Critical components - load immediately (above-fold only)
import Hero from './components/Hero';
import PublicLayout from './components/PublicLayout';

// Below-fold landing page sections - lazy loaded
const Services = lazy(() => import('./components/Services'));
const About = lazy(() => import('./components/About'));
const Technologies = lazy(() => import('./components/Technologies'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Blog = lazy(() => import('./components/Blog'));
const FAQ = lazy(() => import('./components/FAQ'));
const Partners = lazy(() => import('./components/Partners'));
const Contact = lazy(() => import('./components/Contact'));

// Lazy load pages (route-based splitting - these actually benefit from it)
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const NapCRMLandingPage = lazy(() => import('./pages/NapCRMLandingPage'));
const NapMailLandingPage = lazy(() => import('./pages/NapMailLandingPage'));
const CRMPricingPage = lazy(() => import('./pages/CRMPricingPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const SecurityPolicy = lazy(() => import('./pages/SecurityPolicy'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const CityLandingPage = lazy(() => import('./pages/seo/CityLandingPage'));
const IndustryLandingPage = lazy(() => import('./pages/IndustryLandingPage'));
const CustomWebDevelopment = lazy(() => import('./pages/services/CustomWebDevelopment'));
const MobileAppDevelopment = lazy(() => import('./pages/services/MobileAppDevelopment'));
const AiMachineLearning = lazy(() => import('./pages/services/AiMachineLearning'));
const CloudSolutions = lazy(() => import('./pages/services/CloudSolutions'));
const EcommerceDevelopment = lazy(() => import('./pages/services/EcommerceDevelopment'));
const AiTrends2026 = lazy(() => import('./pages/blog/AiTrends2026'));
const ReactVsFlutter = lazy(() => import('./pages/blog/ReactVsFlutter'));
const CostOfCustomCrm = lazy(() => import('./pages/blog/CostOfCustomCrm'));
const MonolithToMicroservices = lazy(() => import('./pages/blog/MonolithToMicroservices'));
const PwaBenefits = lazy(() => import('./pages/blog/PwaBenefits'));
const BlogArticle = lazy(() => import('./pages/BlogArticle'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminBackupsPage = lazy(() => import('./pages/AdminBackupsPage'));

// CSS-based scroll reveal - replaces framer-motion whileInView wrappers
function ScrollReveal({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { rootMargin: '-50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  </div>
);

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!user?.role || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

// Memoized Landing Page for better performance
const HOME_FAQ_SCHEMA = [
  {
    question: 'How long does it typically take to complete a web development project?',
    answer: 'Project timelines vary based on complexity and requirements. A simple website typically takes 4-6 weeks, while complex web applications can take 3-6 months.',
  },
  {
    question: 'What technologies do you use for web and mobile development?',
    answer: 'We use React, Next.js, Node.js, Python, Flutter, React Native, and cloud platforms like AWS, Azure, and Google Cloud.',
  },
  {
    question: 'Do you provide ongoing maintenance and support after project completion?',
    answer: 'Yes, we offer maintenance and support packages including bug fixes, security updates, performance monitoring, and technical assistance.',
  },
  {
    question: 'Do you serve clients globally?',
    answer: 'Yes. Napnix works with clients in India, USA, UK, Canada, Australia, UAE, and other markets across multiple time zones.',
  },
  {
    question: 'Can you help with SEO-friendly websites?',
    answer: 'Yes. We build with semantic HTML, fast load times, mobile responsiveness, structured data, and Core Web Vitals best practices.',
  },
];

const LandingPage = memo(function LandingPage() {
  const homeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ_SCHEMA.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      <Helmet>
        <title>Custom Software Development Company | Web, Mobile, CRM & AI | Napnix</title>
        <meta name="description" content="Napnix builds custom web apps, mobile apps, CRM systems, AI workflows, and cloud platforms for startups and enterprises worldwide. Based in Mohali, serving India, USA, UK, UAE, and beyond." />
        <meta name="keywords" content={DEFAULT_SITE_KEYWORDS} />
        <link rel="canonical" href={`${SITE_URL}/`} />

        {/* Open Graph */}
        <meta property="og:title" content="Custom Software Development Company | Web, Mobile, CRM & AI | Napnix" />
        <meta property="og:description" content="Custom web apps, mobile apps, CRM systems, AI workflows, and cloud platforms for startups and enterprises. Mohali-based team serving global clients." />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Napnix" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@napnix" />
        <meta name="twitter:creator" content="@napnix" />
        <meta name="twitter:title" content="Custom Software Development Company | Web, Mobile, CRM & AI | Napnix" />
        <meta name="twitter:description" content="Custom web apps, mobile apps, CRM systems, AI workflows, and cloud platforms for startups and enterprises worldwide." />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(homeFaqSchema)}</script>
      </Helmet>

      {/* Hero loads immediately for faster FCP */}
      <Hero />

      <ScrollReveal>
        <Suspense fallback={null}>
          <Services />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <About />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <Technologies />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <Testimonials />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <Blog />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <FAQ />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <Partners />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
      </ScrollReveal>
    </div>
  );
});

function RedirectNexCRMIndustry() {
  const { industry } = useParams();
  return <Navigate to={`/napcrm/industries/${industry}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <TelemetryTracker />
      <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/portfolio" element={<Navigate to="/" replace />} />
          <Route path="/portfolio/:slug" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/napcrm" element={<NapCRMLandingPage />} />
          <Route path="/napcrm/pricing" element={<CRMPricingPage />} />
          <Route path="/napcrm/industries/:industry" element={<IndustryLandingPage />} />
          <Route path="/napmail" element={<NapMailLandingPage />} />
          <Route path="/nexcrm" element={<Navigate to="/napcrm" replace />} />
          <Route path="/nexcrm/pricing" element={<Navigate to="/napcrm/pricing" replace />} />
          <Route path="/nexcrm/industries/:industry" element={<RedirectNexCRMIndustry />} />
          <Route path="/nexmail" element={<Navigate to="/napmail" replace />} />
          <Route path="/admin/backups" element={<ProtectedRoute><AdminBackupsPage /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/security" element={<SecurityPolicy />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/software-development-company/:city" element={<CityLandingPage />} />
          <Route path="/services/custom-web-development" element={<CustomWebDevelopment />} />
          <Route path="/services/mobile-app-development" element={<MobileAppDevelopment />} />
          <Route path="/services/ai-machine-learning" element={<AiMachineLearning />} />
          <Route path="/services/cloud-solutions" element={<CloudSolutions />} />
          <Route path="/services/ecommerce-development" element={<EcommerceDevelopment />} />
          <Route path="/blog/ai-trends-2026" element={<AiTrends2026 />} />
          <Route path="/blog/react-native-vs-flutter" element={<ReactVsFlutter />} />
          <Route path="/blog/cost-of-custom-crm-2026" element={<CostOfCustomCrm />} />
          <Route path="/blog/monolith-to-microservices" element={<MonolithToMicroservices />} />
          <Route path="/blog/why-business-needs-pwa" element={<PwaBenefits />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
