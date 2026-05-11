import { useEffect, useRef } from 'react';

const FadeIn = ({
    children,
    className,
    delay = 0,
    y = 20,
    duration = 0.6,
    margin = '-50px',
}) => {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.style.transitionDelay = `${delay}s`;
                    el.classList.add('revealed');
                    observer.unobserve(el);
                }
            },
            { rootMargin: margin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay, margin]);

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${className || ''}`}
            style={{ '--reveal-y': `${y}px`, '--reveal-duration': `${duration}s` }}
        >
            {children}
        </div>
    );
};

export default FadeIn;
