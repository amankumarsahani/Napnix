import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import EnquiryPopup from './EnquiryPopup';
import PageLoader from './PageLoader';
import SiteSchema from './seo/SiteSchema';

const PublicLayout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-white overflow-x-hidden w-full">
            <SiteSchema />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:rounded focus:shadow-lg">Skip to content</a>
            <Header />
            <main id="main-content">
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
