import React, { useState } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import useNetworkStatus from '../../hooks/useNetworkStatus';

const OfflineBanner = () => {
    const { isOffline, justReconnected } = useNetworkStatus();
    const [isDismissed, setIsDismissed] = useState(false);

    // If offline state changes back to online, reset dismissed state
    React.useEffect(() => {
        if (!isOffline) {
            setIsDismissed(false);
        }
    }, [isOffline]);

    if ((!isOffline && !justReconnected) || (isOffline && isDismissed)) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="assertive"
            className="fixed top-2 sm:top-3 inset-x-0 z-[99999] pointer-events-none flex justify-center px-3"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 4px)' }}
        >
            {isOffline ? (
                <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-[#1a0507]/95 text-red-100 backdrop-blur-2xl px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold shadow-[0_12px_35px_rgba(239,68,68,0.35)] border border-red-500/50 animate-in slide-in-from-top duration-300">
                    {/* Red pulsing live indicator */}
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>

                    {/* Red WifiOff icon */}
                    <div className="p-1 rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
                        <WifiOff className="w-3.5 h-3.5 text-red-400" />
                    </div>

                    <div className="flex items-center gap-1.5 leading-tight">
                        <span className="font-bold text-white tracking-tight">You are offline</span>
                        <span className="hidden sm:inline text-red-200/80 font-normal">
                            • Saved items & cart ready
                        </span>
                    </div>

                    {/* Quick dismiss button */}
                    <button
                        onClick={() => setIsDismissed(true)}
                        aria-label="Dismiss offline notice"
                        className="ml-1 p-0.5 text-red-300/70 hover:text-white rounded-full hover:bg-red-500/20 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <div className="pointer-events-auto flex items-center gap-2.5 bg-[#07190f]/95 text-emerald-100 backdrop-blur-2xl px-4 py-2 rounded-full text-xs font-semibold shadow-[0_12px_35px_rgba(16,185,129,0.35)] border border-emerald-500/50 animate-in slide-in-from-top duration-300">
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>Back Online • Syncing live products</span>
                </div>
            )}
        </div>
    );
};

export default OfflineBanner;
