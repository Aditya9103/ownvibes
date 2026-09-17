import React from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { updateApp } from '../../pwa/registerSW';

const UpdatePrompt = ({ show, onDismiss }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md animate-in slide-in-from-bottom duration-300">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-gray-200/80 dark:border-gray-800 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-[#cf7e28] flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                New Version Available
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                An update with fresh improvements is ready for Ownvibes.
                            </p>
                        </div>
                    </div>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            aria-label="Dismiss update"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <button
                        onClick={updateApp}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#cf7e28] hover:bg-[#b86d1f] active:scale-[0.98] text-white text-xs sm:text-sm font-medium py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-600/20"
                    >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Update Now
                    </button>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            Later
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdatePrompt;
