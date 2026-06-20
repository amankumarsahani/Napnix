import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, siteConfig } from '../constants/siteConfig';

const CookiePolicy = () => (
    <div className="pt-24 pb-16 bg-white min-h-screen">
        <Helmet>
            <title>Cookie Policy | Napnix</title>
            <meta name="description" content="Learn how Napnix uses cookies and similar technologies on napnix.in, and how you can manage your preferences." />
            <link rel="canonical" href={`${SITE_URL}/cookie-policy`} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Cookie Policy | Napnix" />
            <meta property="og:description" content="How Napnix uses cookies, analytics, and similar technologies." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${SITE_URL}/cookie-policy`} />
            <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
            <meta property="og:site_name" content="Napnix" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@napnix" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-8">Cookie Policy</h1>
            <div className="prose prose-lg prose-blue text-slate-600">
                <p className="text-xl text-slate-500 mb-8">Last updated: June 20, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">1. What Are Cookies?</h2>
                    <p className="mb-4">
                        Cookies are small text files stored on your device when you visit a website. They help the site remember preferences, measure usage, and improve security. Similar technologies include local storage, session storage, and pixels.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">2. How Napnix Uses Cookies</h2>
                    <p className="mb-4">We use cookies and similar tools for the following purposes:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li><strong>Essential operation</strong> — session management, form security, and load balancing.</li>
                        <li><strong>Analytics</strong> — Google Analytics (G-RM3W4K8VWK) to understand traffic patterns and improve content.</li>
                        <li><strong>Security</strong> — Google reCAPTCHA on contact and inquiry forms to reduce spam and abuse.</li>
                        <li><strong>Preferences</strong> — remembering choices such as currency display where applicable.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Third-Party Cookies</h2>
                    <p className="mb-4">
                        Some cookies are set by services we use, including Google (Analytics, reCAPTCHA, Fonts) and our hosting/CDN providers. These third parties may process data according to their own policies.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Managing Cookies</h2>
                    <p className="mb-4">
                        You can control cookies through your browser settings — block, delete, or limit cookies at any time. Blocking essential cookies may affect form submission or site functionality. To opt out of Google Analytics, visit{' '}
                        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">
                            Google&apos;s opt-out page
                        </a>.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Related Policies</h2>
                    <p className="mb-4">
                        For details on how we handle personal data, see our{' '}
                        <Link to="/privacy-policy" className="text-[#2563EB] hover:underline">Privacy Policy</Link>
                        {' '}and{' '}
                        <Link to="/security" className="text-[#2563EB] hover:underline">Security Policy</Link>.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Contact</h2>
                    <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
                        <p className="font-semibold text-slate-800">Napnix</p>
                        <p>Email: {siteConfig.email.info}</p>
                        <p>Privacy enquiries: {siteConfig.email.support}</p>
                        <p>Address: Mohali, SAS Nagar, Punjab, IN</p>
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export default CookiePolicy;
