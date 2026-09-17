import React, { useEffect, useRef, useState, useCallback } from 'react';
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
    const isHistoryPushed = useRef(false);

    // 1. Android Hardware Back Button Sentinel
    useEffect(() => {
        if (!isOpen) return;

        // Push state so back button closes the sheet instead of navigating
        window.history.pushState({ bottomSheetOpen: true }, '');
        isHistoryPushed.current = true;

        const handlePopState = () => {
            isHistoryPushed.current = false;
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        // Lock background body scroll
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.body.style.overflow = prevOverflow;

            // If closed via UI (not popstate), pop the pushed history entry
            if (isHistoryPushed.current) {
                isHistoryPushed.current = false;
                window.history.back();
            }
        };
    }, [isOpen, onClose]);

    // 2. Escape Key Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
            onClose();
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
                onClick={onClose}
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
                className="relative w-full sm:max-w-lg bg-white dark:bg-[#181818] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 z-10"
            >
                {/* Drag Handle Bar (Mobile Only) */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="w-full pt-3 pb-2 flex flex-col items-center cursor-grab active:cursor-grabbing select-none"
                >
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>

                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="px-5 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                        {title ? (
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                                {title}
                            </h3>
                        ) : (
                            <div />
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                aria-label="Close sheet"
                                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={18} />
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
