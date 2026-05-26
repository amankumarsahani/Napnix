import { lazy, memo, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from './constants/siteConfig';
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
const Portfolio = lazy(() => import('./components/Portfolio'));
const Technologies = lazy(() => import('./components/Technologies'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Blog = lazy(() => import('./components/Blog'));
const FAQ = lazy(() => import('./components/FAQ'));
const Partners = lazy(() => import('./components/Partners'));
const Contact = lazy(() => import('./components/Contact'));

// Lazy load pages (route-based splitting - these actually benefit from it)
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const NexCRMLandingPage = lazy(() => import('./pages/NexCRMLandingPage'));
const NexMailLandingPage = lazy(() => import('./pages/NexMailLandingPage'));
const CRMPricingPage = lazy(() => import('./pages/CRMPricingPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
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
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
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
const LandingPage = memo(function LandingPage() {
  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      <Helmet>
        <title>Napnix - Custom Software, CRM, AI and SEO Delivery</title>
        <meta name="description" content="Napnix builds custom web apps, mobile apps, CRM systems, AI workflows, cloud platforms, and technical SEO experiences for startups and growing businesses." />
        <meta name="keywords" content="AI software development, custom software agency, web development company mohali, freelance developers chandigarh, mobile app developers, digital transformation services, React developers, Next.js experts, best software agency in mohali, freelance software engineer" />
        <link rel="canonical" href={`${SITE_URL}/`} />

        {/* Open Graph */}
        <meta property="og:title" content="Napnix - Custom Software, CRM, AI and SEO Delivery" />
        <meta property="og:description" content="Custom web development, mobile apps, CRM systems, AI workflows, cloud engineering, and technical SEO for growing businesses." />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Napnix - Software, CRM, AI and SEO Delivery" />
        <meta name="twitter:description" content="Custom software engineering, CRM systems, AI workflows, and technical SEO from Mohali for global clients." />
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
          <Portfolio />
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
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/nexcrm" element={<NexCRMLandingPage />} />
          <Route path="/nexcrm/pricing" element={<CRMPricingPage />} />
          <Route path="/nexcrm/industries/:industry" element={<IndustryLandingPage />} />
          <Route path="/nexmail" element={<NexMailLandingPage />} />
          <Route path="/admin/backups" element={<ProtectedRoute><AdminBackupsPage /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
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
          <Route path="/portfolio/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
