import { Workbox } from 'workbox-window';

let wb = null;

export const initPWA = ({ onNeedRefresh, onOfflineReady } = {}) => {
    // Only register service worker in production builds to prevent dev MIME-type conflicts and preserve Vite HMR
    if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        import.meta.env.DEV
    ) {
        return null;
    }

    // Initialize Workbox with the generated service worker path
    wb = new Workbox('/sw.js');

    // Fired when a new service worker has installed and is waiting to activate
    wb.addEventListener('waiting', (event) => {
        console.log('[PWA] New update available, waiting to activate');
        if (onNeedRefresh) {
            onNeedRefresh(true);
        }
    });

    // Fired when the service worker is controlling the page for the first time
    wb.addEventListener('activated', (event) => {
        if (!event.isUpdate) {
            console.log('[PWA] App ready to work offline');
            if (onOfflineReady) {
                onOfflineReady();
            }
        }
    });

    // Fired when the new service worker takes over control of the page
    wb.addEventListener('controlling', () => {
        console.log('[PWA] New service worker controlling page, reloading...');
        window.location.reload();
    });

    // Register service worker
    wb.register().catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err);
    });

    return wb;
};

export const updateApp = async () => {
    if (wb) {
        // Send SKIP_WAITING to waiting worker
        wb.messageSkipWaiting();
    } else if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }
};

export const clearUserCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_USER_CACHE' });
    }
};
