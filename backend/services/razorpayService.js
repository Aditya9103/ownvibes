import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Ensure keys exist
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!keyId || !keySecret) {
    console.warn('⚠️ Razorpay credentials missing in environment variables');
}

const razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
});

/**
 * Creates an order in Razorpay
 * @param {Object} params
 * @param {number} params.amountInInr - Amount in INR
 * @param {string} params.receipt - Internal order identifier
 * @param {Object} [params.notes] - Additional metadata
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async ({ amountInInr, receipt, notes = {} }) => {
    try {
        const amountInPaise = Math.round(amountInInr * 100);
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receipt.toString().slice(-40), // Razorpay limits receipt to 40 chars
            notes: {
                ...notes,
                platform: 'Ownvibes Web'
            }
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        return razorpayOrder;
    } catch (error) {
        console.error('❌ Razorpay Order Creation Error:', error);
        throw new Error(error.error?.description || error.message || 'Failed to create Razorpay order');
    }
};

/**
 * Verifies payment signature returned by frontend Razorpay Checkout
 * @param {Object} params
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpaySignature
 * @returns {boolean}
 */
export const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return false;
    }

    try {
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');

        // Timing-safe comparison to prevent timing attacks
        const sigBuf = Buffer.from(razorpaySignature, 'utf-8');
        const genBuf = Buffer.from(generatedSignature, 'utf-8');

        if (sigBuf.length !== genBuf.length) {
            return false;
        }

        return crypto.timingSafeEqual(sigBuf, genBuf);
    } catch (err) {
        console.error('❌ Signature Verification Exception:', err);
        return false;
    }
};

/**
 * Verifies webhook signature received from Razorpay servers
 * @param {Buffer|string} rawBody - Raw request body
 * @param {string} signature - x-razorpay-signature header
 * @returns {boolean}
 */
export const verifyWebhookSignature = (rawBody, signature) => {
    if (!rawBody || !signature || !webhookSecret) {
        return false;
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        const sigBuf = Buffer.from(signature, 'utf-8');
        const expBuf = Buffer.from(expectedSignature, 'utf-8');

        if (sigBuf.length !== expBuf.length) {
            return false;
        }

        return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch (err) {
        console.error('❌ Webhook Signature Verification Exception:', err);
        return false;
    }
};

/**
 * Fetches detailed payment information from Razorpay API
 * @param {string} paymentId
 * @returns {Promise<Object>}
 */
export const fetchPaymentDetails = async (paymentId) => {
    try {
        return await razorpayInstance.payments.fetch(paymentId);
    } catch (error) {
        console.error(`❌ Error fetching Razorpay payment ${paymentId}:`, error);
        return null;
    }
};

/**
 * Initiates a full or partial refund
 * @param {Object} params
 * @param {string} params.paymentId - Razorpay payment ID
 * @param {number} [params.amountInInr] - Optional amount for partial refund (in INR)
 * @param {string} [params.reason] - Reason for refund
 * @param {Object} [params.notes]
 * @returns {Promise<Object>}
 */
export const createRefund = async ({ paymentId, amountInInr, reason = '', notes = {} }) => {
    try {
        const options = {
            notes: {
                ...notes,
                reason
            }
        };

        if (amountInInr && amountInInr > 0) {
            options.amount = Math.round(amountInInr * 100); // convert to paise
        }

        const refund = await razorpayInstance.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        console.error(`❌ Razorpay Refund Error for ${paymentId}:`, error);
        throw new Error(error.error?.description || error.message || 'Failed to process refund with Razorpay');
    }
};

export default {
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    fetchPaymentDetails,
    createRefund,
    getKeyId: () => keyId
};
