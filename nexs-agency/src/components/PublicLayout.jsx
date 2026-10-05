import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import EnquiryPopup from './EnquiryPopup';
import PageLoader from './PageLoader';
import SiteSchema from './seo/SiteSchema';
import { trackPageView } from '../utils/fbpixel';

const PublicLayout = () => {
    const location = useLocation();
    const isFirstLoad = useRef(true);

    // Fire a Meta Pixel PageView on every SPA route change.
    // The first load PageView is already fired by the base pixel in index.html,
    // so skip it here to avoid double-counting.
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        trackPageView();
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-white overflow-x-hidden w-full">
            <SiteSchema />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:rounded focus:shadow-lg">Skip to content</a>
            <Header />
            {/* min-height holds the footer in place while the lazy route
                content resolves. Without it the Suspense fallback is far
                shorter than real content, so the footer sits high and then
                jumps down — measured at 0.400 CLS on /napcrm and
                /napcrm/pricing under mobile throttling. */}
            <main id="main-content" className="min-h-[100vh]">
                <Suspense fallback={<PageLoader />} key={location.pathname}>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
            <EnquiryPopup />
        </div>
    );
};

export default PublicLayout;
