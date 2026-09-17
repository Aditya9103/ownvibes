import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const DISMISS_THRESHOLD = 80;

const BottomSheet = ({
    isOpen,
    onClose,
    title,
    children,
    maxHeight = '85vh',
    showCloseButton = true,
}) => {
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);
    const sheetRef = useRef(null);

    // Keep latest onClose in a ref so effects don't re-run and trigger history cleanups
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // 1. Android Hardware Back Button Sentinel
    useEffect(() => {
        if (!isOpen) return;

        let isClosedByPop = false;
        try {
            window.history.pushState({ bottomSheetOpen: true }, '');
        } catch (e) {
            // Ignore if pushState is restricted
        }

        const handlePopState = () => {
            isClosedByPop = true;
            if (onCloseRef.current) {
                onCloseRef.current();
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Lock background body scroll
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.body.style.overflow = prevOverflow;

            // If closed via UI (close button, backdrop, apply button) instead of popstate,
            // clean up the history entry we pushed so the user doesn't have an extra back state
            if (!isClosedByPop) {
                if (window.history.state && window.history.state.bottomSheetOpen) {
                    window.history.back();
                }
            }
        };
    }, [isOpen]); // ONLY depends on isOpen — never re-runs when filter selections change

    // 2. Escape Key Listener
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onCloseRef.current) {
                onCloseRef.current();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // 3. Touch Drag-to-Dismiss Gestures
    const handleTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;
        // Only allow dragging downward
        if (diff > 0) {
            setDragY(diff);
        } else {
            setDragY(0);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragY > DISMISS_THRESHOLD) {
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(8);
            }
            if (onCloseRef.current) {
                onCloseRef.current();
            }
        }
        setDragY(0);
    };

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200"
        >
            {/* Backdrop */}
            <div
                onClick={() => onCloseRef.current && onCloseRef.current()}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            {/* Bottom Sheet Card */}
            <div
                ref={sheetRef}
                style={{
                    maxHeight,
                    transform: dragY > 0 ? `translateY(${dragY}px)` : 'none',
                    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
                }}
                className="relative w-full sm:max-w-lg bg-white/98 dark:bg-[#141414]/98 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)] border-t border-amber-500/20 sm:border sm:border-gray-200/60 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 z-10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle Bar (Mobile Only) */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="w-full pt-3.5 pb-2 flex flex-col items-center cursor-grab active:cursor-grabbing select-none"
                >
                    <div className="w-12 h-1.5 bg-gray-300/80 dark:bg-gray-700/80 rounded-full" />
                </div>

                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="px-5 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
                        {title ? (
                            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">
                                {title}
                            </h3>
                        ) : (
                            <div />
                        )}
                        {showCloseButton && (
                            <button
                                onClick={() => onCloseRef.current && onCloseRef.current()}
                                aria-label="Close sheet"
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition-all active:scale-95"
                            >
                                <X size={16} strokeWidth={2.2} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content Container */}
                <div className="p-5 overflow-y-auto overscroll-contain flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BottomSheet;
