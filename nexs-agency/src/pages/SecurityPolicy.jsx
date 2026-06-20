import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, siteConfig } from '../constants/siteConfig';

const SecurityPolicy = () => (
    <div className="pt-24 pb-16 bg-white min-h-screen">
        <Helmet>
            <title>Security Policy | Napnix</title>
            <meta name="description" content="How Napnix protects client data, applications, and infrastructure. Security practices for our website, NapCRM, and NapMail products." />
            <link rel="canonical" href={`${SITE_URL}/security`} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Security Policy | Napnix" />
            <meta property="og:description" content="Napnix security practices for data protection, access control, and secure delivery." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${SITE_URL}/security`} />
            <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
            <meta property="og:site_name" content="Napnix" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@napnix" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-8">Security Policy</h1>
            <div className="prose prose-lg prose-blue text-slate-600">
                <p className="text-xl text-slate-500 mb-8">Last updated: June 20, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Our Commitment</h2>
                    <p className="mb-4">
                        Napnix builds software for businesses that depend on reliable, secure systems. This policy describes the security measures we apply to our website, client projects, and products (NapCRM, NapMail).
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Website &amp; Communication Security</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>HTTPS/TLS encryption for all traffic to napnix.in.</li>
                        <li>Security headers including HSTS, X-Frame-Options, and Content-Security-Policy where supported by our host.</li>
                        <li>Google reCAPTCHA on public inquiry forms to reduce automated abuse.</li>
                        <li>Separate mailboxes for info, sales, support, and admin to limit exposure of sensitive threads.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Application &amp; Data Protection</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Passwords hashed using industry-standard algorithms; secrets stored in environment variables, not in source code.</li>
                        <li>Role-based access control for admin and product dashboards.</li>
                        <li>Encrypted telemetry payloads where analytics are collected.</li>
                        <li>Regular dependency updates and security patches on active projects.</li>
                        <li>Database backups for production systems with restricted access.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Infrastructure</h2>
                    <p className="mb-4">
                        We deploy on reputable cloud and hosting providers with network-level protections, automated TLS, and monitoring. Production environments are separated from development where feasible. Access to servers and databases is limited to authorized team members.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Incident Response</h2>
                    <p className="mb-4">
                        If we identify a security issue affecting client data, we investigate promptly, contain the impact, and notify affected clients as required by contract and applicable law. Report vulnerabilities responsibly to{' '}
                        <a href={`mailto:${siteConfig.email.support}`} className="text-[#2563EB] hover:underline">{siteConfig.email.support}</a>.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Compliance &amp; Privacy</h2>
                    <p className="mb-4">
                        We design systems with data minimization and access controls in mind. For personal data handling, see our{' '}
                        <Link to="/privacy-policy" className="text-[#2563EB] hover:underline">Privacy Policy</Link>
                        {' '}and{' '}
                        <Link to="/cookie-policy" className="text-[#2563EB] hover:underline">Cookie Policy</Link>.
                        Enterprise clients may request additional security documentation during procurement.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Contact</h2>
                    <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
                        <p className="font-semibold text-slate-800">Napnix Security</p>
                        <p>Email: {siteConfig.email.support}</p>
                        <p>Phone: {siteConfig.phone.primary}</p>
                        <p>Address: Mohali, SAS Nagar, Punjab, IN</p>
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export default SecurityPolicy;
