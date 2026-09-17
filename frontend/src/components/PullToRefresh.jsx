import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const PULL_THRESHOLD = 75;
const MAX_PULL = 120;

const PullToRefresh = ({ children, onRefresh }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);
    const queryClient = useQueryClient();

    useEffect(() => {
        const isTouchDevice =
            typeof window !== 'undefined' &&
            ('ontouchstart' in window || navigator.maxTouchPoints > 0);

        if (!isTouchDevice) return;

        let trackingTouch = false;

        const handleTouchStart = (e) => {
            if (window.scrollY <= 0 && !isRefreshing) {
                trackingTouch = true;
                startY.current = e.touches[0].clientY;
                currentY.current = e.touches[0].clientY;
            } else {
                trackingTouch = false;
            }
        };

        const handleTouchMove = (e) => {
            if (!trackingTouch || isRefreshing) return;

            currentY.current = e.touches[0].clientY;
            const diff = currentY.current - startY.current;

            if (diff > 0 && window.scrollY <= 0) {
                const dampedPull = Math.min(MAX_PULL, Math.pow(diff, 0.85));
                setPullDistance(dampedPull);
                setIsPulling(true);

                if (dampedPull >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
                    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                        navigator.vibrate(10);
                    }
                }

                if (e.cancelable && diff > 10) {
                    e.preventDefault();
                }
            } else {
                setPullDistance(0);
                setIsPulling(false);
            }
        };

        const handleTouchEnd = async () => {
            if (!trackingTouch || isRefreshing) return;
            trackingTouch = false;

            if (pullDistance >= PULL_THRESHOLD) {
                setIsRefreshing(true);
                setPullDistance(52);

                if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate([10, 30, 10]);
                }

                try {
                    if (onRefresh) {
                        await onRefresh();
                    } else {
                        await queryClient.refetchQueries();
                    }
                } catch (err) {
                    console.warn('[PullToRefresh] Refresh failed:', err);
                } finally {
                    setTimeout(() => {
                        setIsRefreshing(false);
                        setPullDistance(0);
                        setIsPulling(false);
                    }, 400);
                }
            } else {
                setPullDistance(0);
                setIsPulling(false);
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [pullDistance, isRefreshing, onRefresh, queryClient]);

    const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
    const strokeDashoffset = 100 - progress * 100;

    return (
        <div className="relative w-full">
            {/* Pull Indicator Container */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-center transition-transform z-30"
                style={{
                    transform: `translateY(${pullDistance - 44}px)`,
                    opacity: pullDistance > 12 ? 1 : 0,
                    transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s',
                }}
            >
                <div className="relative w-11 h-11 rounded-full bg-white/95 dark:bg-[#181818]/95 backdrop-blur-xl shadow-[0_10px_28px_-4px_rgba(207,126,40,0.3)] border border-amber-500/25 flex items-center justify-center text-[#cf7e28]">
                    {/* Circular Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 36 36">
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            className="stroke-gray-200/50 dark:stroke-gray-700/50"
                            strokeWidth="2.5"
                            fill="none"
                        />
                        <circle
                            cx="18"
                            cy="18"
                            r="15"
                            className="stroke-[#cf7e28] transition-all duration-75"
                            strokeWidth="2.5"
                            strokeDasharray="100"
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>

                    {/* Icon: Arrow when pulling, Spinning Refresh when triggered */}
                    {isRefreshing ? (
                        <RefreshCw size={17} className="animate-spin text-[#cf7e28]" />
                    ) : (
                        <ArrowDown
                            size={16}
                            className="text-[#cf7e28] transition-transform duration-100"
                            style={{
                                transform: progress >= 1 ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Page Content with elastic pull translation */}
            <div
                style={{
                    transform: pullDistance > 0 ? `translateY(${pullDistance * 0.45}px)` : 'none',
                    transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
