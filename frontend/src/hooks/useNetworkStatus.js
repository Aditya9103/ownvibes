import { useState, useEffect } from 'react';

/**
 * Hook for reliable online/offline status detection across all browsers & devices
 */
export const useNetworkStatus = () => {
    const [isOffline, setIsOffline] = useState(() => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
        return !navigator.onLine;
    });
    const [justReconnected, setJustReconnected] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let reconnectTimer = null;

        const handleOnline = () => {
            setIsOffline(false);
            setJustReconnected(true);
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => {
                setJustReconnected(false);
            }, 3500);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setJustReconnected(false);
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Fallback poller to detect changes if OS/browser doesn't dispatch event immediately
        const pollInterval = setInterval(() => {
            if (typeof navigator !== 'undefined') {
                const currentOffline = !navigator.onLine;
                setIsOffline((prev) => {
                    if (prev !== currentOffline) {
                        if (!currentOffline) {
                            handleOnline();
                        } else {
                            handleOffline();
                        }
                        return currentOffline;
                    }
                    return prev;
                });
            }
        }, 2000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(pollInterval);
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, []);

    return { isOffline, justReconnected };
};

export default useNetworkStatus;
