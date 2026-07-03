import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FadeIn from '../components/ui/FadeIn';
import { SITE_URL } from '../constants/siteConfig';
import { RiCheckLine, RiArrowRightLine, RiMailLine, RiTimer2Line, RiCalendarCheckLine } from 'react-icons/ri';

const AUDIT_STEPS = [
    { icon: RiMailLine, title: 'Check your inbox', desc: 'A confirmation email is on its way. If it isn\'t there in a minute, check spam or promotions.' },
    { icon: RiTimer2Line, title: 'We reply fast', desc: 'Our team reaches out within business hours to lock a time — usually the same day.' },
    { icon: RiCalendarCheckLine, title: 'Your 20-min audit', desc: 'We\'ll walk your enquiry-to-close flow live and send a written summary of where leads leak.' },
];

const GENERAL_STEPS = [
    { icon: RiMailLine, title: 'Check your inbox', desc: 'A confirmation email is on its way. If it isn\'t there in a minute, check spam or promotions.' },
    { icon: RiTimer2Line, title: 'We reply fast', desc: 'Our team gets back to you within business hours — usually the same day.' },
    { icon: RiCalendarCheckLine, title: 'Next: a quick call', desc: 'We\'ll discuss your goals and the best next step, whether that\'s NapCRM or a custom build.' },
];

const ThankYouPage = () => {
    const location = useLocation();
    const intent = location.state?.intent;
    const name = location.state?.name;
    const isAudit = intent === 'audit';
    const steps = isAudit ? AUDIT_STEPS : GENERAL_STEPS;

    useEffect(() => {
        import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3B82F6', '#8B5CF6', '#10B981'],
            });
        }).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
            <Helmet>
                <title>Thank You — Napnix</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href={`${SITE_URL}/thank-you`} />
            </Helmet>

            <section className="flex-1 flex items-center py-24 bg-gradient-to-b from-white to-[#F8FAFC]">
                <div className="container-custom">
                    <FadeIn duration={0.6}>
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-4xl mx-auto mb-8">
                                <RiCheckLine />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                                {name ? `Thanks, ${name}.` : 'Thank you.'}
                            </h1>
                            <p className="text-lg text-slate-600 mb-2">
                                {isAudit
                                    ? 'Your Revenue-Leak Audit request is in.'
                                    : 'Your message is in — we\'ve got it.'}
                            </p>
                            <p className="text-slate-500">
                                We take our own follow-up seriously. Here's exactly what happens next.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="max-w-3xl mx-auto mt-14 grid gap-5 md:grid-cols-3">
                        {steps.map(({ icon: Icon, title, desc }, i) => (
                            <FadeIn key={title} duration={0.5}>
                                <div className="h-full p-6 rounded-2xl border border-slate-200 bg-white text-center">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center text-2xl mx-auto mb-4">
                                        <Icon />
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Step {i + 1}</div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>

                    <div className="max-w-3xl mx-auto mt-14 text-center">
                        <p className="text-slate-500 mb-6">While you wait, take a look at what we've built.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/portfolio" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-colors">
                                See our work
                                <RiArrowRightLine />
                            </Link>
                            <Link to="/napcrm" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                                Explore NapCRM
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ThankYouPage;
