import { useState, useEffect, useCallback } from 'react';

const COOLDOWN_KEY = 'ownvibes_install_dismissed_until';
const VISIT_COUNT_KEY = 'ownvibes_pwa_visits';
const SNOOZE_DAYS = 2;

// Module-level global listener to capture beforeinstallprompt immediately,
// even before React finishes mounting or hydrating
let globalDeferredPrompt = typeof window !== 'undefined' ? window.__ownvibes_install_prompt || null : null;

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        globalDeferredPrompt = e;
        window.__ownvibes_install_prompt = e;
        window.dispatchEvent(new Event('ownvibes:installable'));
    });
}

export const useInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(
        globalDeferredPrompt || (typeof window !== 'undefined' ? window.__ownvibes_install_prompt : null)
    );
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
            setCanPrompt(false);
            return;
        }

        // 2. Check if iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice =
            /iphone|ipad|ipod/.test(userAgent) &&
            !window.MSStream &&
            !isStandalone;
        setIsIOS(isIOSDevice);

        // 3. Check snooze cooldown
        const dismissedUntil = localStorage.getItem(COOLDOWN_KEY);
        const isSnoozed = !import.meta.env.DEV && dismissedUntil && Date.now() < Number(dismissedUntil);

        const currentVisits = Number(localStorage.getItem(VISIT_COUNT_KEY) || '0') + 1;
        localStorage.setItem(VISIT_COUNT_KEY, String(currentVisits));

        // Testing and programmatic helpers on window
        window.__clearInstallSnooze = () => {
            localStorage.removeItem(COOLDOWN_KEY);
            if (globalDeferredPrompt) {
                setDeferredPrompt(globalDeferredPrompt);
                setCanPrompt(true);
            }
        };

        window.__showInstallBanner = () => {
            localStorage.removeItem(COOLDOWN_KEY);
            const prompt = globalDeferredPrompt || window.__ownvibes_install_prompt;
            if (prompt) {
                setDeferredPrompt(prompt);
            }
            setCanPrompt(true);
        };

        // 4. If beforeinstallprompt was already captured before mount
        const existingPrompt = globalDeferredPrompt || window.__ownvibes_install_prompt;
        if (existingPrompt && !isSnoozed) {
            setDeferredPrompt(existingPrompt);
            const timer = setTimeout(() => setCanPrompt(true), 1200);
            return () => clearTimeout(timer);
        }

        // 5. Listen for beforeinstallprompt event when it fires
        const handlePromptAvailable = (e) => {
            if (e && e.preventDefault) {
                e.preventDefault();
                globalDeferredPrompt = e;
                window.__ownvibes_install_prompt = e;
            }
            setDeferredPrompt(globalDeferredPrompt || window.__ownvibes_install_prompt);

            if (!isSnoozed) {
                setTimeout(() => {
                    setCanPrompt(true);
                }, 1200);
            }
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setCanPrompt(false);
            setDeferredPrompt(null);
            globalDeferredPrompt = null;
            window.__ownvibes_install_prompt = null;
            console.log('[PWA] Ownvibes app installed successfully');
        };

        window.addEventListener('beforeinstallprompt', handlePromptAvailable);
        window.addEventListener('ownvibes:installable', handlePromptAvailable);
        window.addEventListener('appinstalled', handleAppInstalled);

        // For iOS devices: show manual guide if not snoozed
        if (isIOSDevice && !isSnoozed) {
            const iosTimer = setTimeout(() => {
                setCanPrompt(true);
            }, 2500);
            return () => {
                clearTimeout(iosTimer);
                window.removeEventListener('beforeinstallprompt', handlePromptAvailable);
                window.removeEventListener('ownvibes:installable', handlePromptAvailable);
                window.removeEventListener('appinstalled', handleAppInstalled);
            };
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handlePromptAvailable);
            window.removeEventListener('ownvibes:installable', handlePromptAvailable);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        const activePrompt = deferredPrompt || globalDeferredPrompt || window.__ownvibes_install_prompt;
        if (!activePrompt) {
            return false;
        }

        // Directly launch native browser installation dialog
        activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setCanPrompt(false);
            setDeferredPrompt(null);
            globalDeferredPrompt = null;
            window.__ownvibes_install_prompt = null;
            return true;
        } else {
            // User cancelled in system dialog
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
        deferredPrompt,
        promptInstall,
        dismissPrompt,
    };
};
