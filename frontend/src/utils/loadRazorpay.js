/**
 * Dynamically loads the Razorpay checkout script if not already present
 * @returns {Promise<boolean>}
 */
export const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            console.error('❌ Failed to load Razorpay Checkout SDK');
            resolve(false);
        };

        document.body.appendChild(script);
    });
};

export default loadRazorpay;
