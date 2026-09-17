import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, Star, Zap, Wifi, ShieldCheck } from 'lucide-react';
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
            className="fixed right-3 sm:right-6 z-[9999] pointer-events-none animate-in slide-in-from-top-4 fade-in duration-400 ease-out"
            style={{
                top: 'calc(max(env(safe-area-inset-top, 0px), 0px) + 12px)',
            }}
        >
            <div
                className="w-[calc(100vw-24px)] max-w-[390px] pointer-events-auto relative overflow-hidden bg-white/98 backdrop-blur-2xl rounded-[24px] p-4 sm:p-5 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.3),0_0_0_1px_rgba(217,119,6,0.25)] border border-stone-200/90 flex flex-col gap-3.5 transition-all"
                style={{ backgroundColor: '#ffffff' }}
            >

                {/* Subtle Ambient Gold Radiance in Corners */}
                <div className="absolute -top-14 -right-14 w-36 h-36 bg-gradient-to-br from-amber-400/20 via-amber-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-14 -left-14 w-32 h-32 bg-gradient-to-tr from-amber-500/15 via-orange-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Dismiss X Button (Top Right) */}
                <button
                    onClick={handleDismiss}
                    aria-label="Dismiss install prompt"
                    className="absolute top-3.5 right-3.5 z-20 p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Main Identity & Smartphone Showcase Row */}
                <div className="flex items-center gap-3.5 sm:gap-4 pr-6 relative z-10">
                    {/* Miniature Luxury Smartphone Showcase Frame */}
                    <div className="relative shrink-0 w-[62px] sm:w-[70px] h-[96px] sm:h-[106px] rounded-[18px] p-[2.5px] bg-gradient-to-b from-stone-700 via-stone-850 to-stone-950 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.32),0_0_0_1px_rgba(255,255,255,0.18)] flex flex-col justify-between overflow-visible group">
                        {/* Screen Mockup Inner */}
                        <div className="relative w-full h-full rounded-[15px] overflow-hidden bg-stone-900 border border-black/40 flex flex-col">
                            {/* Dynamic Island Notch */}
                            <div className="absolute top-1 inset-x-0 mx-auto w-4 h-[3px] bg-black/90 rounded-full z-20 shadow-xs pointer-events-none" />

                            {/* Live App Screenshot Preview */}
                            <img
                                src="/screens/home-narrow.png"
                                alt=""
                                aria-hidden="true"
                                role="presentation"
                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />

                            {/* Glossy Screen Reflection Glint */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Floating Official App Squircle Icon Badge */}
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-[9px] bg-white p-[1.5px] shadow-[0_4px_12px_rgba(0,0,0,0.25)] ring-1 ring-amber-500/50 overflow-hidden flex items-center justify-center z-20 transition-transform group-hover:scale-110">
                            <img
                                src="/icons/icon-192.png"
                                alt=""
                                aria-hidden="true"
                                role="presentation"
                                className="w-full h-full object-cover rounded-[7px]"
                            />
                        </div>
                    </div>

                    {/* App Details & Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Top Badge & Rating Row */}
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
                                style={{ color: '#78350f', backgroundColor: '#fef3c7' }}
                            >
                                <Sparkles size={10} className="text-amber-600 animate-pulse" />
                                Official App
                            </span>

                            <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/80 px-2 py-0.5 rounded-full text-[11px] font-extrabold text-stone-900 shadow-xs">
                                <Star size={11} className="fill-amber-500 text-amber-500 shrink-0" />
                                <span style={{ color: '#111827' }}>4.9</span>
                            </div>
                        </div>

                        {/* Brand Title & Verified Shield */}
                        <div className="flex items-center gap-1.5 mt-1">
                            <h3
                                className="font-serif text-[19px] sm:text-[21px] font-black text-stone-900 tracking-tight leading-none"
                                style={{ color: '#111827' }}
                            >
                                Ownvibes
                            </h3>
                            <ShieldCheck size={16} className="text-amber-600 fill-amber-100 shrink-0" />
                        </div>

                        {/* Store Specs Subtitle */}
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold flex-wrap">
                            <span className="text-stone-600 font-medium" style={{ color: '#4b5563' }}>Direct Store PWA</span>
                            <span className="text-stone-300 font-black">•</span>
                            <span className="text-emerald-700 font-black" style={{ color: '#047857' }}>Free</span>
                            <span className="text-stone-300 font-black">•</span>
                            <span className="text-stone-500 font-semibold" style={{ color: '#6b7280' }}>Fast & Secure</span>
                        </div>

                        {/* Luxury Perk Badges */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span
                                className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200/90 px-2.5 py-1 rounded-lg text-[11px] font-bold text-stone-800 shadow-2xs"
                                style={{ color: '#1f2937', backgroundColor: '#f5f5f4' }}
                            >
                                <Zap size={12} className="text-amber-600 shrink-0" />
                                1-Tap Checkout
                            </span>
                            <span
                                className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200/90 px-2.5 py-1 rounded-lg text-[11px] font-bold text-stone-800 shadow-2xs"
                                style={{ color: '#1f2937', backgroundColor: '#f5f5f4' }}
                            >
                                <Wifi size={12} className="text-amber-600 shrink-0" />
                                Offline Bag
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Area */}
                {isIOS ? (
                    /* iOS Safari Instructions */
                    <div
                        className="bg-amber-50/90 rounded-2xl p-3.5 text-xs text-stone-800 space-y-2 border border-amber-200 shadow-xs"
                        style={{ backgroundColor: '#fffbeb', color: '#1f2937' }}
                    >
                        <p className="font-bold text-stone-900 flex items-center gap-1.5" style={{ color: '#111827' }}>
                            <Sparkles size={13} className="text-amber-600" />
                            Install on your iPhone or iPad:
                        </p>
                        <ol className="space-y-1.5 pl-0.5 text-[12px] text-stone-700" style={{ color: '#374151' }}>
                            <li className="flex items-center gap-2">
                                <span
                                    className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0"
                                    style={{ color: '#ffffff', backgroundColor: '#d97706' }}
                                >
                                    1
                                </span>
                                <span>Tap <Share size={13} className="inline mx-1 text-amber-600" /> <strong>Share</strong> in Safari bottom bar</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span
                                    className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0"
                                    style={{ color: '#ffffff', backgroundColor: '#d97706' }}
                                >
                                    2
                                </span>
                                <span>Scroll down & tap <PlusSquare size={13} className="inline mx-1 text-amber-600" /> <strong>Add to Home Screen</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span
                                    className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0"
                                    style={{ color: '#ffffff', backgroundColor: '#d97706' }}
                                >
                                    3
                                </span>
                                <span>Tap <strong>Add</strong> in the top-right</span>
                            </li>
                        </ol>
                        <button
                            onClick={handleDismiss}
                            className="w-full mt-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                            style={{ color: '#ffffff', backgroundColor: '#1c1917' }}
                        >
                            Got It
                        </button>
                    </div>
                ) : (
                    /* Android / Desktop Install Action */
                    <div className="flex items-center gap-2.5 pt-0.5 relative z-10">
                        <button
                            onClick={handleInstallClick}
                            disabled={installing}
                            className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] hover:from-[#92400e] hover:to-[#92400e] active:scale-[0.98] text-white text-xs sm:text-sm font-black py-3.5 px-4 rounded-xl shadow-[0_8px_22px_-3px_rgba(217,119,6,0.45)] hover:shadow-[0_12px_28px_-3px_rgba(217,119,6,0.55)] transition-all disabled:opacity-75 whitespace-nowrap relative overflow-hidden group"
                            style={{ color: '#ffffff' }}
                        >
                            {/* Subtle Button Shimmer Ray */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform pointer-events-none" />

                            <Download size={16} className={`shrink-0 text-white transition-transform group-hover:scale-110 ${installing ? 'animate-bounce' : ''}`} style={{ color: '#ffffff' }} />
                            <span className="text-white font-black tracking-wide" style={{ color: '#ffffff' }}>
                                {installing ? 'Opening Installer...' : 'Install App (Free)'}
                            </span>
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="shrink-0 whitespace-nowrap px-4 py-3.5 text-xs sm:text-sm font-extrabold text-stone-500 hover:text-stone-900 rounded-xl transition-colors hover:bg-stone-100 active:bg-stone-200"
                            style={{ color: '#4b5563' }}
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
