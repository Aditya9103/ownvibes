import { useEffect } from 'react';

/**
 * Syncs the native app badge (icon counter on mobile home screen) with the cart count.
 * Progressive enhancement: gracefully does nothing if Badging API is not supported.
 */
export const useAppBadge = (count) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count).catch((err) => {
                    console.debug('[Badging API] setAppBadge error:', err);
                });
            } else if ('clearAppBadge' in navigator) {
                navigator.clearAppBadge().catch((err) => {
                    console.debug('[Badging API] clearAppBadge error:', err);
                });
            }
        }
    }, [count]);
};
