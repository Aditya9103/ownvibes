import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const InstallBanner = () => {
    const { canPrompt, isInstalled, isIOS, promptInstall, dismissPrompt } = useInstallPrompt();
    const [installing, setInstalling] = useState(false);

    if (!canPrompt || isInstalled) return null;

    const handleInstallClick = async () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(8);
        }
        setInstalling(true);
        try {
            await promptInstall();
        } finally {
            setInstalling(false);
        }
    };

    return (
        <aside
            aria-label="Install App"
            className="fixed inset-x-0 bottom-16 md:bottom-6 z-40 px-3 sm:px-6 pointer-events-none animate-in slide-in-from-bottom duration-300"
        >
            <div className="max-w-md mx-auto pointer-events-auto bg-white/95 dark:bg-[#181818]/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-gray-200/80 dark:border-gray-800 flex flex-col gap-3.5">
                {/* Header with App Logo */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/icon-192.png"
                            alt="Ownvibes App Icon"
                            className="w-12 h-12 rounded-xl object-cover shadow-md border border-gray-200/60 dark:border-gray-700"
                        />
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                    Install Ownvibes
                                </h4>
                                <span className="bg-amber-100 dark:bg-amber-900/40 text-[#cf7e28] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    PWA
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                Fast shopping, offline access & live order tracking.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => dismissPrompt()}
                        aria-label="Dismiss install prompt"
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors -mr-1"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                {isIOS ? (
                    /* iOS Safari Instructions */
                    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 space-y-2 border border-gray-100 dark:border-gray-800">
                        <p className="font-semibold text-gray-900 dark:text-white">
                            To install on your iPhone or iPad:
                        </p>
                        <ol className="space-y-1.5 pl-1">
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-[10px] shadow-sm">1</span>
                                <span>Tap the <Share size={14} className="inline mx-0.5 text-[#cf7e28]" /> <strong>Share</strong> button below</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-[10px] shadow-sm">2</span>
                                <span>Scroll & tap <PlusSquare size={14} className="inline mx-0.5 text-[#cf7e28]" /> <strong>Add to Home Screen</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-[10px] shadow-sm">3</span>
                                <span>Tap <strong>Add</strong> in the top-right corner</span>
                            </li>
                        </ol>
                        <button
                            onClick={() => dismissPrompt()}
                            className="w-full mt-2 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                ) : (
                    /* Android / Desktop Install Action */
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={handleInstallClick}
                            disabled={installing}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#cf7e28] hover:bg-[#b58145] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-amber-600/20 transition-all disabled:opacity-75"
                        >
                            <Download size={15} className={installing ? 'animate-bounce' : ''} />
                            {installing ? 'Opening installer...' : 'Install App'}
                        </button>
                        <button
                            onClick={() => dismissPrompt()}
                            className="px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Not now
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default InstallBanner;
