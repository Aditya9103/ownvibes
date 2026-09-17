import React, { useState, useEffect } from 'react';

const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Only show once per browser/app session so navigation remains instant
        const hasSeenSplash = sessionStorage.getItem('ownvibes_splash_seen');
        if (hasSeenSplash) {
            setIsVisible(false);
            return;
        }

        // Start fading out after 1.5 seconds
        const fadeTimer = setTimeout(() => {
            setIsFading(true);
        }, 1500);

        // Remove completely from DOM after fade completes
        const removeTimer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('ownvibes_splash_seen', 'true');
        }, 2100);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, []);

    const handleDismiss = () => {
        setIsFading(true);
        setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('ownvibes_splash_seen', 'true');
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <div
            onClick={handleDismiss}
            role="presentation"
            aria-label="Welcome to Ownvibes"
            className={`fixed inset-0 z-[99999] bg-[#0d0d0e] flex flex-col items-center justify-center select-none cursor-pointer transition-opacity duration-600 ease-out ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            {/* Full-bleed Luxury Screen Graphic */}
            <picture className="absolute inset-0 w-full h-full pointer-events-none">
                <source media="(min-width: 768px)" srcSet="/screens/home-wide.png" />
                <img
                    src="/screens/home-narrow.png"
                    alt="Ownvibes App"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    decoding="sync"
                />
            </picture>

            {/* Subtle Gradient Vignette at Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Bottom Brand Accent & Loading Pulse */}
            <div className="absolute bottom-8 sm:bottom-10 inset-x-0 flex flex-col items-center gap-3 px-6 z-10 pointer-events-none">
                <div className="w-28 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                    <div className="w-1/2 h-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-500 rounded-full animate-[pulse_1.2s_infinite_ease-in-out]" />
                </div>
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-200/90 drop-shadow-sm">
                    Wear Your Vibe
                </span>
            </div>
        </div>
    );
};

export default SplashScreen;
