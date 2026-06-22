import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        sessionStorage.removeItem('napnix-chunk-reload');
    }, [pathname]);

    return null;
};

export default ScrollToTop;
