import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// In-memory scroll position cache per path
const scrollPositions = new Map();

export default function ScrollToTop() {
    const location = useLocation();
    const navType = useNavigationType();
    const currentPathRef = useRef(location.pathname + location.search);

    // Track scroll position before navigating away
    useEffect(() => {
        const handleScroll = () => {
            const key = currentPathRef.current;
            scrollPositions.set(key, window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Handle Route change: restore position on POP (Back/Forward), scroll to top on PUSH
    useEffect(() => {
        const targetKey = location.pathname + location.search;

        if (navType === 'POP') {
            const savedPosition = scrollPositions.get(targetKey) || 0;
            // Use requestAnimationFrame to ensure DOM is rendered before restoring scroll
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: savedPosition,
                    behavior: 'instant',
                });
            });
        } else {
            // Fresh navigation: scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'instant',
            });
        }

        currentPathRef.current = targetKey;
    }, [location.pathname, location.search, navType]);

    return null;
}
