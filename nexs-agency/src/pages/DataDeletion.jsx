import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, siteConfig } from '../constants/siteConfig';

const DataDeletion = () => (
    <div className="pt-24 pb-16 bg-white min-h-screen">
        <Helmet>
            <title>Data Deletion Instructions | Napnix</title>
            <meta name="description" content="How to request deletion of your personal data from Napnix and NapCRM, including data shared via connected apps like WhatsApp and Facebook Login." />
            <link rel="canonical" href={`${SITE_URL}/data-deletion`} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Data Deletion Instructions | Napnix" />
            <meta property="og:description" content="Request deletion of your personal data from Napnix." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${SITE_URL}/data-deletion`} />
            <meta property="og:site_name" content="Napnix" />
        </Helmet>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-8">Data Deletion Instructions</h1>
            <div className="prose prose-lg prose-blue text-slate-600">
                <p className="text-xl text-slate-500 mb-8">Last updated: July 10, 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Overview</h2>
                    <p className="mb-4">
                        This page explains how you can request deletion of personal data that Napnix or NapCRM holds about you, including data received through connected third-party platforms such as WhatsApp Business (Meta) and Facebook/Instagram Login. See our <Link to="/privacy-policy" className="text-[#2563EB] hover:underline">Privacy Policy</Link> for what data we collect and why.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">2. What Gets Deleted</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>Your identity and contact data (name, email, phone) held in our systems.</li>
                        <li>Message history exchanged with a business through our WhatsApp integration, where that business is a Napnix/NexCRM customer.</li>
                        <li>Any account or profile data created via Facebook/Instagram Login integrations.</li>
                        <li>Associated logs and analytics records tied directly to your identity.</li>
                    </ul>
                    <p className="mb-4">
                        Data we are legally required to retain (e.g. financial records, records needed for fraud prevention or dispute resolution) will be retained only as long as required by law, then deleted.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">3. How to Request Deletion</h2>
                    <p className="mb-4">
                        Email <a href={`mailto:${siteConfig.contact.support}`} className="text-[#2563EB] hover:underline">{siteConfig.contact.support}</a> with the subject line <strong>&ldquo;Data Deletion Request&rdquo;</strong>, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                        <li>The phone number, email, or account you used to interact with a Napnix/NexCRM business.</li>
                        <li>The business name (if known) you messaged or interacted with.</li>
                    </ul>
                    <p className="mb-4">
                        We verify the request against our records and process deletion within <strong>30 days</strong>. We will confirm by email once complete.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Contact</h2>
                    <p className="mb-4">
                        Questions about this process: <a href={`mailto:${siteConfig.contact.support}`} className="text-[#2563EB] hover:underline">{siteConfig.contact.support}</a>.
                    </p>
                </section>
            </div>
        </div>
    </div>
);

export default DataDeletion;
