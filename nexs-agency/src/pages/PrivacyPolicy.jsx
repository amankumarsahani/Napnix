import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, siteConfig } from '../constants/siteConfig';

const PrivacyPolicy = () => (
    <div className="pt-24 pb-16 bg-white min-h-screen">
        <Helmet>
            <title>Privacy Policy | Napnix</title>
            <meta name="description" content="Napnix privacy policy: what data we collect, how we use it, your rights, retention, and how to contact us about privacy." />
            <link rel="canonical" href={`${SITE_URL}/privacy-policy`} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Privacy Policy | Napnix" />
            <meta property="og:description" content="How Napnix collects, uses, stores, and protects personal data." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${SITE_URL}/privacy-policy`} />
            <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Privacy Policy | Napnix" />
            <meta name="twitter:description" content="How Napnix collects, uses, stores, and protects personal data." />
            <meta property="og:site_name" content="Napnix" />
            <meta name="twitter:site" content="@napnix" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-8">Privacy Policy</h1>
            <div className="prose prose-lg prose-blue text-slate-600">
                <p className="text-xl text-slate-500 mb-8">Last updated: June 20, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Introduction</h2>
                    <p className="mb-4">
                        Napnix (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates napnix.in and related products including NapCRM. This policy explains what personal data we collect, why we collect it, how long we keep it, and your rights. By using our website or services, you acknowledge this policy.
                    </p>
                    <p className="mb-4">
                        For cookie-specific information, see our <Link to="/cookie-policy" className="text-[#2563EB] hover:underline">Cookie Policy</Link>. For security practices, see our <Link to="/security" className="text-[#2563EB] hover:underline">Security Policy</Link>.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Data We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li><strong>Identity &amp; contact data</strong> — name, email, phone, company name submitted via forms or support channels.</li>
                        <li><strong>Project &amp; inquiry data</strong> — messages, intent (sales, demo, support), and product interest you provide.</li>
                        <li><strong>Technical data</strong> — IP address, browser type, device information, pages visited, referral source, and timestamps (via analytics and server logs).</li>
                        <li><strong>Product usage data</strong> — for NapCRM accounts: login activity, configuration settings, and usage metrics necessary to operate the service.</li>
                        <li><strong>Payment data</strong> — billing handled by payment processors (e.g. Razorpay); we do not store full card numbers on our servers.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">3. How We Use Your Data</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Respond to enquiries, demos, and support requests.</li>
                        <li>Deliver contracted software development and product services.</li>
                        <li>Process payments and manage subscriptions.</li>
                        <li>Improve website performance, content, and product features.</li>
                        <li>Detect fraud, spam, and security incidents (including reCAPTCHA).</li>
                        <li>Comply with legal obligations and enforce our <Link to="/terms" className="text-[#2563EB] hover:underline">Terms of Service</Link>.</li>
                    </ul>
                    <p className="mb-4">
                        We process data based on consent (forms, marketing where applicable), contract performance (client work), legitimate interests (security, analytics, product improvement), and legal obligations.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Sharing &amp; Processors</h2>
                    <p className="mb-4">We do not sell personal data. We may share data with:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Hosting and infrastructure providers.</li>
                        <li>Analytics providers (Google Analytics).</li>
                        <li>Payment processors (Razorpay).</li>
                        <li>Email and communication tools used to respond to you.</li>
                        <li>Professional advisers or authorities when required by law.</li>
                    </ul>
                    <p className="mb-4">Sub-processors are bound by confidentiality and data protection obligations appropriate to their role.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">5. International Transfers</h2>
                    <p className="mb-4">
                        Napnix is based in India and serves clients globally. Data may be processed in India or in countries where our service providers operate. We apply reasonable safeguards for cross-border transfers as required by applicable law.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Retention</h2>
                    <p className="mb-4">
                        We retain enquiry data for as long as needed to respond and maintain business records (typically up to 3 years unless a longer period is required for active contracts or legal compliance). Product account data is retained for the life of the account plus a reasonable period thereafter. Analytics data is retained according to provider settings.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Your Rights</h2>
                    <p className="mb-4">Depending on your location, you may have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Access, correct, or delete your personal data.</li>
                        <li>Object to or restrict certain processing.</li>
                        <li>Withdraw consent where processing is consent-based.</li>
                        <li>Request data portability where applicable.</li>
                        <li>Lodge a complaint with a supervisory authority.</li>
                    </ul>
                    <p className="mb-4">To exercise these rights, email {siteConfig.email.support} with sufficient detail to identify your request.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Children</h2>
                    <p className="mb-4">Our services are not directed at children under 16. We do not knowingly collect data from children.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">9. Changes</h2>
                    <p className="mb-4">We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top will reflect changes. Material updates may be communicated via the website.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">10. Contact</h2>
                    <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
                        <p className="font-semibold text-slate-800">Napnix — Data Protection</p>
                        <p>Email: {siteConfig.email.info}</p>
                        <p>Privacy &amp; support: {siteConfig.email.support}</p>
                        <p>Phone: {siteConfig.phone.primary}</p>
                        <p>Address: Mohali, SAS Nagar, Punjab, IN</p>
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export default PrivacyPolicy;
