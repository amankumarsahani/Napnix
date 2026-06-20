import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, siteConfig } from '../constants/siteConfig';

const TermsOfService = () => (
    <div className="pt-24 pb-16 bg-white min-h-screen">
        <Helmet>
            <title>Terms of Service | Napnix</title>
            <meta name="description" content="Terms and conditions for using the Napnix website, NapCRM, NapMail, and custom software development services." />
            <link rel="canonical" href={`${SITE_URL}/terms`} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Terms of Service | Napnix" />
            <meta property="og:description" content="Terms and conditions for Napnix website and services." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${SITE_URL}/terms`} />
            <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Terms of Service | Napnix" />
            <meta name="twitter:description" content="Terms and conditions for Napnix website and services." />
            <meta property="og:site_name" content="Napnix" />
            <meta name="twitter:site" content="@napnix" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-8">Terms of Service</h1>
            <div className="prose prose-lg prose-blue text-slate-600">
                <p className="text-xl text-slate-500 mb-8">Last updated: June 20, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Agreement</h2>
                    <p className="mb-4">
                        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of napnix.in and related services operated by Napnix, including NapCRM, NapMail, and custom software development engagements. By accessing our website or using our services, you agree to these Terms and our <Link to="/privacy-policy" className="text-[#2563EB] hover:underline">Privacy Policy</Link>.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Services</h2>
                    <p className="mb-4">
                        Napnix provides software development, product subscriptions, and related consulting. Specific deliverables, timelines, fees, and support levels for client projects are defined in separate statements of work, proposals, or subscription agreements that supplement these Terms.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Website Use</h2>
                    <p className="mb-4">You agree not to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Use the website for unlawful, fraudulent, or abusive purposes.</li>
                        <li>Attempt unauthorized access to systems, accounts, or data.</li>
                        <li>Scrape, reverse engineer, or disrupt site operation except as permitted by law.</li>
                        <li>Submit false or misleading information through forms.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Accounts &amp; Subscriptions</h2>
                    <p className="mb-4">
                        Product accounts (NapCRM, NapMail) require accurate registration information. You are responsible for safeguarding credentials and activity under your account. Subscription fees, billing cycles, trials, and cancellation terms are specified on the relevant pricing page and checkout flow.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Intellectual Property</h2>
                    <p className="mb-4">
                        Napnix retains ownership of its website content, brand assets, and pre-existing product code unless otherwise agreed in writing. For custom development, intellectual property ownership is governed by the applicable client contract. You may not copy, modify, or redistribute Napnix materials without permission.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Confidentiality</h2>
                    <p className="mb-4">
                        Both parties may receive confidential information during engagements. Each party agrees to protect the other&apos;s confidential information and use it only for the purpose of the engagement, except where disclosure is required by law.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Warranties &amp; Disclaimer</h2>
                    <p className="mb-4">
                        We strive to deliver reliable services but, except as expressly stated in a signed agreement, the website and services are provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, or non-infringement.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Limitation of Liability</h2>
                    <p className="mb-4">
                        To the maximum extent permitted by law, Napnix shall not be liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, or goodwill arising from use of the website or services. Our aggregate liability for any claim relating to these Terms shall not exceed the fees paid by you to Napnix in the twelve (12) months preceding the claim, or INR 50,000, whichever is greater, unless a higher limit is set in a signed contract.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">9. Termination</h2>
                    <p className="mb-4">
                        We may suspend or terminate access for violations of these Terms or for security reasons. You may stop using the website at any time. Provisions that by nature should survive termination (IP, liability limits, governing law) will remain in effect.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">10. Governing Law</h2>
                    <p className="mb-4">
                        These Terms are governed by the laws of India. Courts in Mohali, Punjab shall have exclusive jurisdiction, subject to mandatory consumer protection laws in your jurisdiction where applicable.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">11. Contact</h2>
                    <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
                        <p className="font-semibold text-slate-800">Napnix</p>
                        <p>Email: {siteConfig.email.info}</p>
                        <p>Legal &amp; contracts: {siteConfig.email.sales}</p>
                        <p>Address: Mohali, SAS Nagar, Punjab, IN</p>
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export default TermsOfService;
