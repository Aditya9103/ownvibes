import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [justReconnected, setJustReconnected] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setJustReconnected(true);
            const timer = setTimeout(() => {
                setJustReconnected(false);
            }, 3000);
            return () => clearTimeout(timer);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setJustReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline && !justReconnected) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed top-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="flex justify-center px-4 pt-2">
                {isOffline ? (
                    <div className="pointer-events-auto flex items-center gap-2 bg-amber-900/90 text-amber-100 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium shadow-lg border border-amber-700/50 animate-in slide-in-from-top duration-300">
                        <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>You are offline. Cached products and cart remain available.</span>
                    </div>
                ) : (
                    <div className="pointer-events-auto flex items-center gap-2 bg-emerald-900/90 text-emerald-100 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium shadow-lg border border-emerald-700/50 animate-in fade-in duration-300">
                        <Wifi className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Back online!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfflineBanner;
