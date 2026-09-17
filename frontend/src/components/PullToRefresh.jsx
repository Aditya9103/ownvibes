import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
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
        // Only enable touch pull-to-refresh on touch devices
        const isTouchDevice =
            typeof window !== 'undefined' &&
            ('ontouchstart' in window || navigator.maxTouchPoints > 0);

        if (!isTouchDevice) return;

        let trackingTouch = false;

        const handleTouchStart = (e) => {
            // Only start tracking if we are at the top of the viewport
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

            // Only track downward pulls when at top of page
            if (diff > 0 && window.scrollY <= 0) {
                // Apply logarithmic resistance damping
                const dampedPull = Math.min(MAX_PULL, Math.pow(diff, 0.85));
                setPullDistance(dampedPull);
                setIsPulling(true);

                // Give light haptic bump when crossing threshold
                if (dampedPull >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
                    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                        navigator.vibrate(10);
                    }
                }

                // Prevent native browser overscroll navigation if pull is active
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
                setPullDistance(50); // Keep spinner visible during refresh

                if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate([10, 30, 10]);
                }

                try {
                    if (onRefresh) {
                        await onRefresh();
                    } else {
                        // Default action: refresh TanStack query cache
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
    const rotation = isRefreshing ? 'animate-spin' : '';

    return (
        <div className="relative w-full">
            {/* Pull Indicator Container */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-center transition-transform z-30"
                style={{
                    transform: `translateY(${pullDistance - 40}px)`,
                    opacity: pullDistance > 10 ? 1 : 0,
                    transition: isPulling ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s',
                }}
            >
                <div className="w-10 h-10 rounded-full bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md shadow-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-[#cf7e28]">
                    <RefreshCw
                        size={18}
                        className={rotation}
                        style={{
                            transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
                            transition: isRefreshing ? undefined : 'transform 0.05s linear',
                        }}
                    />
                </div>
            </div>

            {/* Page Content with elastic pull translation */}
            <div
                style={{
                    transform: pullDistance > 0 ? `translateY(${pullDistance * 0.5}px)` : 'none',
                    transition: isPulling ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
