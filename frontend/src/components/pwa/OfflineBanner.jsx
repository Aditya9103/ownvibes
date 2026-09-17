import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Sparkles } from 'lucide-react';

const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [justReconnected, setJustReconnected] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setJustReconnected(true);
            const timer = setTimeout(() => {
                setJustReconnected(false);
            }, 3200);
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
            className="fixed top-2 inset-x-0 z-50 transition-all duration-300 pointer-events-none flex justify-center px-4"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
        >
            {isOffline ? (
                <div className="pointer-events-auto flex items-center gap-2.5 bg-[#17130e]/95 text-amber-200 backdrop-blur-2xl px-4 py-2 rounded-full text-xs font-semibold shadow-[0_12px_35px_rgba(207,126,40,0.3)] border border-amber-500/35 animate-in slide-in-from-top duration-300">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Offline Mode Active • Saved cart & items ready</span>
                </div>
            ) : (
                <div className="pointer-events-auto flex items-center gap-2.5 bg-[#0b1c14]/95 text-emerald-200 backdrop-blur-2xl px-4 py-2 rounded-full text-xs font-semibold shadow-[0_12px_35px_rgba(16,185,129,0.3)] border border-emerald-500/35 animate-in slide-in-from-top duration-300">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Back Online • Syncing live products</span>
                </div>
            )}
        </div>
    );
};

export default OfflineBanner;
