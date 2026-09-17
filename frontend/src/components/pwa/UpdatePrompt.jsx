import React, { useState } from 'react';
import { RefreshCw, X, Sparkles, ArrowRight } from 'lucide-react';
import { updateApp } from '../../pwa/registerSW';

const UpdatePrompt = ({ show, onDismiss }) => {
    const [updating, setUpdating] = useState(false);

    if (!show) return null;

    const handleUpdate = () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(12);
        }
        setUpdating(true);
        updateApp();
    };

    return (
        <aside
            aria-label="App update available"
            className="fixed inset-x-0 bottom-20 md:bottom-6 z-50 px-4 sm:px-6 pointer-events-none animate-in slide-in-from-bottom duration-400"
        >
            <div className="max-w-md mx-auto pointer-events-auto relative overflow-hidden bg-white/95 dark:bg-[#151515]/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_-10px_rgba(207,126,40,0.25)] border border-amber-500/25 dark:border-amber-500/20 flex flex-col gap-3.5">
                {/* Subtle Amber Radiant Glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-[#cf7e28]/30 to-transparent rounded-full blur-xl pointer-events-none" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#cf7e28] to-[#f3a44d] text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/20">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base tracking-tight">
                                    Fresh Update Ready
                                </h4>
                                <span className="bg-amber-100 dark:bg-amber-900/40 text-[#cf7e28] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                                    NEW
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                Performance upgrades & fresh styles are ready for your device.
                            </p>
                        </div>
                    </div>

                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            aria-label="Dismiss update"
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -mr-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2.5 pt-0.5 relative z-10">
                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#cf7e28] via-[#df8b35] to-[#b56e22] hover:brightness-105 active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold py-2.5 px-4 rounded-xl shadow-md shadow-amber-600/25 transition-all disabled:opacity-75"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />
                        <span>{updating ? 'Refreshing App...' : 'Update Instantly (1s)'}</span>
                    </button>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Later
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default UpdatePrompt;
