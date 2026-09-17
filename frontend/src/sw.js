import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// 1. Clean up old precaches and precache revisioned app assets
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Precache the offline fallback page
const OFFLINE_FALLBACK = '/offline.html';

// 3. Navigation handling (App Shell & Offline Fallback)
// Denylist API, Admin, and checkout endpoints from being handled as SPA navigation fallbacks
const navigationHandler = async (params) => {
    try {
        const networkResponse = await new NetworkFirst({
            cacheName: 'navigations-cache',
            plugins: [
                new CacheableResponsePlugin({ statuses: [200] }),
            ],
        }).handle(params);

        if (networkResponse) return networkResponse;
        throw new Error('Navigation failed');
    } catch (error) {
        const cache = await caches.open('offline-cache');
        const cachedFallback = await cache.match(OFFLINE_FALLBACK);
        if (cachedFallback) return cachedFallback;

        const networkFallback = await fetch(OFFLINE_FALLBACK);
        if (networkFallback) return networkFallback;

        return Response.error();
    }
};

const navigationRoute = new NavigationRoute(navigationHandler, {
    denylist: [/^\/api/, /^\/admin/, /^\/checkout\/payment/]
});
registerRoute(navigationRoute);

// 4. Strict NetworkOnly for sensitive routes (Auth, Payment, Orders creation, Admin, Webhooks)
registerRoute(
    ({ url, request }) => {
        return (
            request.method !== 'GET' ||
            url.pathname.startsWith('/api/payment') ||
            url.pathname.startsWith('/api/admin') ||
            url.pathname.startsWith('/api/auth/login') ||
            url.pathname.startsWith('/api/auth/register') ||
            url.pathname.startsWith('/api/auth/verify-register-otp') ||
            url.pathname.startsWith('/api/auth/send-register-otp') ||
            url.pathname.startsWith('/checkout/payment')
        );
    },
    new NetworkOnly()
);

// 5. Product Images & S3 Media (CacheFirst, 60 days, max 300)
registerRoute(
    ({ url, request }) => {
        return (
            request.method === 'GET' &&
            (
                url.hostname.includes('amazonaws.com') ||
                url.pathname.startsWith('/uploads') ||
                /\.(?:png|jpg|jpeg|svg|webp|avif)$/i.test(url.pathname)
            )
        );
    },
    new CacheFirst({
        cacheName: 'product-images-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 300,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
                purgeOnQuotaError: true
            })
        ]
    })
);

// 6. Google Fonts & Stylesheets (CacheFirst, 1 year)
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: 'google-fonts-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
            })
        ]
    })
);

// 7. Catalog APIs (Products list, Categories, Banners) (StaleWhileRevalidate, 5 min)
registerRoute(
    ({ url, request }) => {
        return (
            request.method === 'GET' &&
            (
                url.pathname === '/api/products' ||
                url.pathname.startsWith('/api/products/search') ||
                url.pathname === '/api/categories' ||
                url.pathname.startsWith('/api/categories/') ||
                url.pathname === '/api/coupons/active' ||
                url.pathname === '/api/reviews'
            )
        );
    },
    new StaleWhileRevalidate({
        cacheName: 'catalog-api-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 5 * 60 // 5 minutes freshness
            })
        ]
    })
);

// 8. Single Product API (StaleWhileRevalidate, 1 hour)
registerRoute(
    ({ url, request }) => {
        return (
            request.method === 'GET' &&
            url.pathname.startsWith('/api/products/') &&
            !url.pathname.includes('/search')
        );
    },
    new StaleWhileRevalidate({
        cacheName: 'product-detail-api-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 // 1 hour freshness
            })
        ]
    })
);

// 9. User-scoped API (Orders, Profile, Addresses) (NetworkFirst with 3s timeout)
registerRoute(
    ({ url, request }) => {
        return (
            request.method === 'GET' &&
            (
                url.pathname.startsWith('/api/orders/my-orders') ||
                url.pathname === '/api/auth/profile' ||
                url.pathname === '/api/auth/addresses'
            )
        );
    },
    new NetworkFirst({
        cacheName: 'user-data-cache',
        networkTimeoutSeconds: 3,
        plugins: [
            new CacheableResponsePlugin({ statuses: [200] }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours fallback
            })
        ]
    })
);

// 10. Service Worker Lifecycle Message Handling
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_USER_CACHE') {
        caches.delete('user-data-cache');
    }
});

// Install event: cache offline fallback
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('offline-cache').then((cache) => cache.add(OFFLINE_FALLBACK))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
