import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CLIENT_ORGANISATIONS } from '../constants/testimonials';

/**
 * Named-client proof strip.
 *
 * Renders the real client organisations from CLIENT_ORGANISATIONS, each linked
 * to its case study where one exists. See the note on that constant for why
 * the previous invented-logo version was removed.
 *
 * The count in the footer line is CLIENT_ORGANISATIONS.length — the number of
 * clients actually named on this page — rather than a rounded "10+", so the
 * claim and the evidence on screen cannot disagree.
 */
export default function ClientLogos({ className = '', title = 'Clients we have built for' }) {
    return (
        <section className={`py-16 bg-white ${className}`}>
            <div className="container-custom">
                <div className="text-center mb-10">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                        {title}
                    </p>
                </div>

                <div className="flex flex-wrap items-stretch justify-center gap-4 md:gap-6">
                    {CLIENT_ORGANISATIONS.map((client, index) => {
                        const card = (
                            <div className="h-full px-6 py-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-center transition-all duration-300 group-hover:border-[#2563EB]/40 group-hover:shadow-lg">
                                <div className="text-base md:text-lg font-semibold text-slate-800">
                                    {client.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {client.sector}
                                </div>
                            </div>
                        );

                        return (
                            <motion.div
                                key={client.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="group"
                            >
                                {client.caseStudy
                                    ? <Link to={client.caseStudy} className="block h-full" aria-label={`Read the ${client.name} case study`}>{card}</Link>
                                    : card}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="text-center mt-8">
                    <p className="text-sm text-slate-500">
                        {CLIENT_ORGANISATIONS.length} named clients across manufacturing, legal,
                        education and fleet operations.{' '}
                        <Link to="/portfolio" className="text-[#2563EB] font-medium hover:underline">
                            Read the case studies
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
