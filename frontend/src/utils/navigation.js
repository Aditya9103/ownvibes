/**
 * Progressive enhancement helper for View Transitions in React Router.
 * Supports directional transitions ('forward' | 'backward') if supported by browser.
 */
export const navigateWithTransition = (navigate, to, options = {}) => {
    const { direction = 'forward', replace = false } = options;

    if (
        typeof document === 'undefined' ||
        !document.startViewTransition ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        navigate(to, { replace });
        return;
    }

    try {
        document.startViewTransition({
            update: () => {
                navigate(to, { replace });
            },
            types: [direction],
        });
    } catch (e) {
        // Fallback for browsers supporting startViewTransition without types parameter
        document.startViewTransition(() => {
            navigate(to, { replace });
        });
    }
};
