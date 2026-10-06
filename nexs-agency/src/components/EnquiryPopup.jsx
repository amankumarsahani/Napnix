import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { inquiryAPI } from '../services/api';
import { trackLead, getMetaContext } from '../utils/fbpixel';
import { getRecaptchaToken } from '../utils/recaptcha';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { RiArrowRightLine, RiCloseLine, RiLoader4Line, RiShieldCheckLine, RiStarLine, RiTimeLine } from 'react-icons/ri';

/*
 * When this popup is allowed to interrupt someone.
 *
 * It is a blocking modal — `fixed inset-0` with a blurred backdrop — and
 * useBodyScrollLock freezes the body while it is open. That is correct for a
 * modal, but it means the trigger decides whether the site feels broken.
 *
 * It previously fired on a blind 15-second timer OR at 50% scroll depth,
 * whichever came first. Both interrupt mid-read, and because the body locks, the
 * visitor's next scroll does nothing at all. Measured on the live homepage:
 * crossing 50% depth set `body { position: fixed; top: -7200px }` and six
 * further wheel events moved the page 0px. Dismissal then suppresses it for
 * seven days, which is why it reads as "it stuck once, then scrolled fine" —
 * precisely the reported symptom.
 *
 * What changed:
 * - The timer is gone. Elapsed time is not an intent signal; it is an ambush.
 * - Scroll depth moved from 0.5 to 0.9, so it asks someone who has read the
 *   page rather than someone halfway through a sentence.
 * - Exit intent added: the pointer leaving through the top of the viewport is
 *   the conventional "about to go" signal, and interrupting then costs nothing.
 * - Pages whose job is to be read and cited are excluded entirely (see
 *   SUPPRESSED_PATHS).
 *
 * Both remaining triggers are higher-intent than a 15-second timer, so this
 * should not cost conversions — but it is a lead-capture change, so watch the
 * enquiry rate rather than assuming.
 */
const SCROLL_THRESHOLD = 0.9;
const STORAGE_KEY = 'napnix_popup_dismissed';
const DISMISS_DAYS = 7;

/*
 * Paths that must never be interrupted.
 *
 * /tools/crm-cost-calculator exists to be linked to and says so on the page;
 * ambushing a reader with a modal is the fastest way to ensure nobody cites it.
 * The /alternatives/* comparisons and /authors/* pages are read end-to-end for
 * the same reason, and /contact already has the form the popup is asking them
 * to fill in.
 */
const SUPPRESSED_PATH_PREFIXES = ['/tools/', '/alternatives/', '/authors/', '/contact'];

const EnquiryPopup = memo(function EnquiryPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const closeTimerRef = useRef(null);
    const successTimerRef = useRef(null);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
        };
    }, []);

    // Check if popup was dismissed recently
    const wasRecentlyDismissed = useCallback(() => {
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (!dismissedAt) return false;
        const dismissDate = new Date(parseInt(dismissedAt));
        const daysSince = (Date.now() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince < DISMISS_DAYS;
    }, []);

    // Show popup logic — intent signals only, never a timer. See the note on
    // SCROLL_THRESHOLD above for why.
    useEffect(() => {
        if (wasRecentlyDismissed()) return;
        if (SUPPRESSED_PATH_PREFIXES.some((p) => window.location.pathname.startsWith(p))) return;

        let hasShown = false;
        const showPopup = () => {
            if (hasShown) return;
            hasShown = true;
            setIsVisible(true);
        };

        // Scroll-depth trigger: they have read essentially the whole page.
        const handleScroll = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable <= 0) return;
            if (window.scrollY / scrollable >= SCROLL_THRESHOLD) showPopup();
        };

        // Exit intent: pointer leaves through the top of the viewport. Desktop
        // only in practice, which is fine — there is no touch equivalent, and
        // guessing one produces exactly the mid-scroll ambush this replaces.
        const handleExitIntent = (e) => {
            if (e.clientY <= 0 && !e.relatedTarget) showPopup();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mouseout', handleExitIntent);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mouseout', handleExitIntent);
        };
    }, [wasRecentlyDismissed]);

    // Close popup with animation
    const closePopup = useCallback(() => {
        setIsClosing(true);
        closeTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
        }, 300);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isVisible) closePopup();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isVisible, closePopup]);

    const dialogRef = useRef(null);
    useEffect(() => {
        if (!isVisible || !dialogRef.current) return;

        const dialog = dialogRef.current;
        const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableEls = dialog.querySelectorAll(focusableSelector);
        if (focusableEls.length === 0) return;

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        firstEl.focus();

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };

        dialog.addEventListener('keydown', handleTab);
        return () => dialog.removeEventListener('keydown', handleTab);
    }, [isVisible]);

    useBodyScrollLock(isVisible);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            let captchaToken = null;
            try {
                captchaToken = await getRecaptchaToken('submit_inquiry');
            } catch {
                setSubmitStatus({ type: 'error', message: 'reCAPTCHA verification failed. Please refresh and try again.' });
                setIsSubmitting(false);
                return;
            }

            // Shared Meta context for browser<->server (CAPI) deduplication.
            const meta = getMetaContext();

            await inquiryAPI.submit({
                ...formData,
                captchaToken,
                contentName: 'enquiry_popup',
                eventId: meta.eventId,
                fbp: meta.fbp,
                fbc: meta.fbc,
                sourceUrl: meta.sourceUrl
            });

            // Meta Pixel conversion: enquiry popup lead (shares eventId with server)
            trackLead({ content_name: 'enquiry_popup' }, meta.eventId);

            setSubmitStatus({
                type: 'success',
                message: 'Thank you! Your free consultation request is in. Our team will reach out within 24 hours.'
            });

            // Close after success
            successTimerRef.current = setTimeout(() => {
                localStorage.setItem(STORAGE_KEY, (Date.now() + 23 * 24 * 60 * 60 * 1000).toString()); // 30 days
                closePopup();
            }, 2500);

        } catch (error) {
            console.error('Form submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to send. Please try again.';
            setSubmitStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            ref={dialogRef}
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
            onClick={closePopup}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title-enquiry"
        >
            {/* Popup Card */}
            <div
                className={`relative w-full max-w-lg transform transition-all duration-500 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    animation: 'popupSlide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-indigo-500/30">
                    {/* Glow effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F8FAFC]/30 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#F8FAFC]/30 rounded-full blur-3xl"></div>

                    {/* Close button */}
                    <button
                        onClick={closePopup}
                        aria-label="Close"
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors group"
                    >
                        <RiCloseLine className="text-white text-xl group- transition-transform" />
                    </button>

                    {/* Header */}
                    <div className="relative px-6 pt-8 pb-4 text-center">
                        <div className="inline-flex items-center bg-[#2563EB]/15 border border-[#2563EB]/30 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            Free Consultation — Limited Slots This Week
                        </div>
                        <h2 id="modal-title-enquiry" className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                            Book a Free Demo
                            <span className="block text-[#60A5FA] mt-1">
                                Get Free Consultation Today
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Talk to our team about your project — no cost, no commitment. Grab this opportunity to get a tailored plan and estimate within 24 hours.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="relative px-6 pb-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        minLength={2}
                                        maxLength={100}
                                        placeholder="Your Name *"
                                        aria-label="Full name"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Email *"
                                        aria-label="Email address"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number (Optional)"
                                    aria-label="Phone number"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all text-sm"
                                />
                            </div>

                            <div>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    minLength={10}
                                    maxLength={2000}
                                    placeholder="Tell us about your project... *"
                                    rows={3}
                                    aria-label="Your message"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all resize-none text-sm"
                                />
                            </div>

                            {/* Status Message */}
                            {submitStatus.message && (
                                <div role="alert" className={`p-3 rounded-lg text-sm ${submitStatus.type === 'success'
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    }`}>
                                    {submitStatus.message}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full relative overflow-hidden bg-[#2563EB] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none group"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    {isSubmitting ? (
                                        <>
                                            <RiLoader4Line className="animate-spin mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Book My Free Demo
                                            <RiArrowRightLine className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        </form>

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
                            <div className="flex items-center">
                                <RiTimeLine className="mr-1 text-green-400" />
                                24hr response
                            </div>
                            <div className="flex items-center">
                                <RiShieldCheckLine className="mr-1 text-blue-400" />
                                100% Secure
                            </div>
                            <div className="flex items-center">
                                <RiStarLine className="mr-1 text-yellow-400" />
                                No commitment
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
})

export default EnquiryPopup;
