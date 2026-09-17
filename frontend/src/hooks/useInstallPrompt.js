import { useState, useEffect, useCallback } from 'react';

const COOLDOWN_KEY = 'ownvibes_install_dismissed_until';
const VISIT_COUNT_KEY = 'ownvibes_pwa_visits';
const SNOOZE_DAYS = 7;

export const useInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [canPrompt, setCanPrompt] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. Check if running in standalone mode (already installed)
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // 2. Check if iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice =
            /iphone|ipad|ipod/.test(userAgent) &&
            !window.MSStream &&
            !isStandalone;
        setIsIOS(isIOSDevice);

        // 3. Track visits and check snooze cooldown
        const dismissedUntil = localStorage.getItem(COOLDOWN_KEY);
        const isSnoozed = dismissedUntil && Date.now() < Number(dismissedUntil);

        const currentVisits = Number(localStorage.getItem(VISIT_COUNT_KEY) || '0') + 1;
        localStorage.setItem(VISIT_COUNT_KEY, String(currentVisits));

        // 4. Listen for beforeinstallprompt event (Android / Chrome / Desktop)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            if (!isSnoozed) {
                // Wait 3 seconds so user gets oriented first
                setTimeout(() => {
                    setCanPrompt(true);
                }, 3000);
            }
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setCanPrompt(false);
            setDeferredPrompt(null);
            console.log('[PWA] Ownvibes app installed successfully');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // For iOS devices, if not snoozed and user visited before, enable the guide
        if (isIOSDevice && !isSnoozed && currentVisits >= 2) {
            setTimeout(() => {
                setCanPrompt(true);
            }, 4000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return false;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setCanPrompt(false);
            setDeferredPrompt(null);
            return true;
        } else {
            // User cancelled in system dialog: snooze for 7 days
            dismissPrompt();
            return false;
        }
    }, [deferredPrompt]);

    const dismissPrompt = useCallback((snoozeDays = SNOOZE_DAYS) => {
        setCanPrompt(false);
        const cooldownExpiry = Date.now() + snoozeDays * 24 * 60 * 60 * 1000;
        localStorage.setItem(COOLDOWN_KEY, String(cooldownExpiry));
    }, []);

    return {
        canPrompt,
        isInstalled,
        isIOS,
        promptInstall,
        dismissPrompt,
    };
};
