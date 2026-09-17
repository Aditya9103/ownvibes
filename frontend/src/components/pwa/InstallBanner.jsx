import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2, Zap, Wifi, Bell } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const InstallBanner = () => {
    const { canPrompt, isInstalled, isIOS, promptInstall, dismissPrompt } = useInstallPrompt();
    const [installing, setInstalling] = useState(false);

    if (!canPrompt || isInstalled) return null;

    const handleInstallClick = async () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(10);
        }
        setInstalling(true);
        try {
            await promptInstall();
        } finally {
            setInstalling(false);
        }
    };

    const handleDismiss = () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(6);
        }
        dismissPrompt();
    };

    return (
        <aside
            aria-label="Install App"
            className="fixed inset-x-0 bottom-16 md:bottom-6 z-40 px-3 sm:px-6 pointer-events-none animate-in slide-in-from-bottom duration-500 ease-out"
        >
            <div className="max-w-md mx-auto pointer-events-auto relative overflow-hidden bg-white/95 dark:bg-[#141414]/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(207,126,40,0.22)] border border-amber-500/20 dark:border-amber-500/15 flex flex-col gap-3.5 transition-all">
                {/* Subtle Ambient Gold Glow in Top-Right */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-[#cf7e28]/25 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                        {/* App Icon with luxury ring */}
                        <div className="relative shrink-0">
                            <img
                                src="/icons/icon-192.png"
                                alt="Ownvibes App Icon"
                                className="w-13 h-13 rounded-2xl object-cover shadow-md shadow-amber-900/10 border-2 border-white dark:border-gray-800"
                            />
                            <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-gradient-to-tr from-[#cf7e28] to-[#e89d4d] rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
                                <Sparkles size={9} strokeWidth={2.5} />
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-[15px] tracking-tight">
                                    Ownvibes Official App
                                </h4>
                                <span className="bg-amber-500/10 dark:bg-amber-500/20 text-[#cf7e28] border border-amber-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                    FAST PWA
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                Enjoy native speed, offline cart & priority VIP offers.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        aria-label="Dismiss install prompt"
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -mr-1"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-3 gap-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                        <Zap size={12} className="text-[#cf7e28]" />
                        <span>Instant</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                        <Wifi size={12} className="text-[#cf7e28]" />
                        <span>Offline</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                        <Bell size={12} className="text-[#cf7e28]" />
                        <span>VIP Drops</span>
                    </div>
                </div>

                {/* Body Action */}
                {isIOS ? (
                    /* iOS Safari Instructions */
                    <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl p-3.5 text-xs text-gray-700 dark:text-gray-300 space-y-2.5 border border-amber-200/50 dark:border-amber-900/40">
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[#cf7e28]" />
                            Add to your iPhone Home Screen:
                        </p>
                        <ol className="space-y-2 pl-0.5 text-[12px]">
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-[10px] shadow-sm text-[#cf7e28]">1</span>
                                <span>Tap <Share size={14} className="inline mx-1 text-[#cf7e28]" /> <strong>Share</strong> in Safari bottom toolbar</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-[10px] shadow-sm text-[#cf7e28]">2</span>
                                <span>Scroll & select <PlusSquare size={14} className="inline mx-1 text-[#cf7e28]" /> <strong>Add to Home Screen</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-[10px] shadow-sm text-[#cf7e28]">3</span>
                                <span>Tap <strong>Add</strong> at top right</span>
                            </li>
                        </ol>
                        <button
                            onClick={handleDismiss}
                            className="w-full mt-1 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            Got It
                        </button>
                    </div>
                ) : (
                    /* Android / Desktop Install Action */
                    <div className="flex items-center gap-2.5 pt-0.5">
                        <button
                            onClick={handleInstallClick}
                            disabled={installing}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#cf7e28] via-[#df8b35] to-[#b56e22] hover:brightness-105 active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-75"
                        >
                            <Download size={16} className={installing ? 'animate-bounce' : ''} />
                            {installing ? 'Opening Installer...' : 'Install App (Free)'}
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-3.5 py-3 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Later
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default InstallBanner;
