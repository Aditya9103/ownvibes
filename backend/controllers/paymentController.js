import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import razorpayService from '../services/razorpayService.js';
import { generateInvoicePDF } from '../services/invoiceService.js';
import { sendOrderPlacedEmail } from '../utils/emailService.js';

/**
 * Executes a callback within a MongoDB ACID Transaction
 * Fallback to non-session execution if standalone Mongo lacks replica set
 */
const runInTransaction = async (workFn) => {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await workFn(session);
        });
        return result;
    } catch (err) {
        // If MongoDB deployment does not support transactions (e.g. standalone test DB), run without session
        if (err.message && err.message.includes('Transaction numbers are only allowed on a replica set member')) {
            console.warn('⚠️ Replica set not active; executing without transaction session.');
            return await workFn(null);
        }
        throw err;
    } finally {
        await session.endSession();
    }
};

/**
 * Idempotent order confirmation & inventory deduction
 * Called by both frontend verify and background webhooks
 */
const confirmPaymentAndFinalizeOrder = async ({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    method = 'unknown',
    methodDetails = {},
    errorDetails = null,
    source = 'verification'
}) => {
    return await runInTransaction(async (session) => {
        const queryOpts = session ? { session } : {};

        // 1. Fetch Order and Payment
        const order = await Order.findById(orderId, null, queryOpts);
        if (!order) {
            throw new Error(`Order #${orderId} not found`);
        }

        let payment = await Payment.findOne({
            $or: [
                { razorpayOrderId },
                { order: order._id }
            ]
        }, null, queryOpts);

        // Idempotency Check: If already captured, do nothing and return
        if (payment && payment.status === 'CAPTURED' && order.status === 'PAID') {
            console.log(`ℹ️ [Idempotent] Order #${orderId} is already confirmed & CAPTURED.`);
            return { order, payment, alreadyProcessed: true };
        }

        // 2. Atomically verify and deduct product stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product, null, queryOpts);
            if (!product) {
                throw new Error(`Product ${item.name} not found`);
            }
            if (product.stock < item.qty) {
                console.warn(`⚠️ Warning: Stock for ${product.name} is ${product.stock}, lower than requested qty ${item.qty}`);
            }
            // Atomically decrement stock
            product.stock = Math.max(0, product.stock - item.qty);
            await product.save(queryOpts);
        }

        // 3. Generate unique invoice number if not already present
        const invoiceNumber = order.invoiceNumber || `INV-OV-${Date.now().toString().slice(-6)}-${order._id.toString().slice(-4).toUpperCase()}`;

        // 4. Transition Order to PAID
        order.status = 'PAID';
        order.isPaid = true;
        order.paidAt = new Date();
        order.invoiceNumber = invoiceNumber;
        order.paymentMethod = 'RAZORPAY';
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpayOrderId = razorpayOrderId;
        order.trackingUpdates.push({
            status: 'Payment Captured',
            location: 'Online Payment Gateway',
            description: `Payment confirmed via Razorpay (Txn ID: ${razorpayPaymentId})`,
            date: new Date()
        });
        await order.save(queryOpts);

        // 5. Transition Payment to CAPTURED
        if (!payment) {
            payment = new Payment({
                order: order._id,
                user: order.user,
                razorpayOrderId,
                amount: order.totalPrice,
                currency: 'INR'
            });
        }

        payment.status = 'CAPTURED';
        payment.razorpayPaymentId = razorpayPaymentId;
        if (razorpaySignature) payment.razorpaySignature = razorpaySignature;
        payment.method = method;
        if (methodDetails) payment.methodDetails = methodDetails;
        if (errorDetails) payment.errorDetails = errorDetails;

        await payment.save(queryOpts);

        order.payment = payment._id;
        await order.save(queryOpts);

        return { order, payment, alreadyProcessed: false };
    });
};

// ==========================================
// 1. CREATE PAYMENT ORDER (Server-Side Truth)
// ==========================================
export const createPaymentOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, couponCode } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
            return res.status(400).json({ message: 'Valid shipping address is required' });
        }

        const userId = req.user._id;

        // Step 1: Validate live products from database & calculate server total
        let serverSubtotal = 0;
        const verifiedOrderItems = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product || item._id);
            if (!product) {
                return res.status(404).json({ message: `Product "${item.name}" is no longer available` });
            }

            if (product.stock < item.qty) {
                return res.status(400).json({
                    message: `Only ${product.stock} units left for "${product.name}". Please update your cart.`
                });
            }

            const itemPrice = Number(product.price);
            serverSubtotal += itemPrice * Number(item.qty);

            verifiedOrderItems.push({
                name: product.name,
                qty: Number(item.qty),
                image: (product.images && product.images.length > 0) ? product.images[0] : (item.image || ''),
                price: itemPrice,
                size: item.size || item.selectedSize || '',
                color: item.color || item.selectedColor || '',
                product: product._id
            });
        }

        // Step 2: Validate coupon if applied
        let discountAmount = 0;
        let appliedCouponCode = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon) {
                discountAmount = (serverSubtotal * coupon.discountPercentage) / 100;
                appliedCouponCode = coupon.code;
            }
        }

        const shippingFee = 0; // Free shipping
        const taxAmount = 0;
        const finalPayableAmount = Math.max(1, Math.round(serverSubtotal - discountAmount + shippingFee + taxAmount));

        // Step 3: Run ACID transaction to create internal Order and initiate Razorpay
        const result = await runInTransaction(async (session) => {
            const queryOpts = session ? { session } : {};

            const order = new Order({
                user: userId,
                orderItems: verifiedOrderItems,
                shippingAddress,
                paymentMethod: 'RAZORPAY',
                totalPrice: finalPayableAmount,
                subtotal: serverSubtotal,
                discountAmount,
                couponCode: appliedCouponCode,
                shippingFee,
                taxAmount,
                status: 'PENDING_PAYMENT',
                trackingUpdates: [
                    {
                        status: 'Order Created',
                        location: 'Online Store',
                        description: 'Order created, awaiting payment authorization.',
                        date: new Date()
                    }
                ]
            });

            const savedOrder = await order.save(queryOpts);

            // Step 4: Create order with Razorpay Gateway
            const razorpayOrder = await razorpayService.createRazorpayOrder({
                amountInInr: finalPayableAmount,
                receipt: savedOrder._id.toString(),
                notes: {
                    orderId: savedOrder._id.toString(),
                    userId: userId.toString(),
                    customerEmail: req.user.email,
                    customerPhone: shippingAddress.phone
                }
            });

            // Step 5: Save internal Payment record
            const payment = new Payment({
                order: savedOrder._id,
                user: userId,
                razorpayOrderId: razorpayOrder.id,
                amount: finalPayableAmount,
                currency: razorpayOrder.currency || 'INR',
                status: 'CREATED'
            });

            await payment.save(queryOpts);

            savedOrder.razorpayOrderId = razorpayOrder.id;
            savedOrder.payment = payment._id;
            await savedOrder.save(queryOpts);

            return { order: savedOrder, razorpayOrder };
        });

        // Step 6: Return only necessary data for Razorpay Checkout
        res.status(201).json({
            success: true,
            orderId: result.order._id,
            razorpayOrderId: result.razorpayOrder.id,
            amount: finalPayableAmount,
            currency: 'INR',
            keyId: razorpayService.getKeyId(),
            user: {
                name: req.user.name || shippingAddress.name,
                email: req.user.email,
                phone: shippingAddress.phone
            }
        });
    } catch (error) {
        console.error('❌ Create Payment Order Error:', error);
        res.status(500).json({
            message: error.message || 'Failed to initiate payment. Please try again.'
        });
    }
};

// ==========================================
// 2. VERIFY PAYMENT (Server Signature Verification)
// ==========================================
export const verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Incomplete payment verification payload' });
        }

        // Step 1: Verify HMAC-SHA256 signature
        const isValid = razorpayService.verifyPaymentSignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        if (!isValid) {
            console.error('🚨 Invalid Payment Signature detected:', { razorpay_order_id, razorpay_payment_id });
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: 'FAILED',
                    errorDetails: {
                        reason: 'Cryptographic signature mismatch during verification'
                    }
                }
            );
            return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
        }

        // Step 2: Fetch payment details from Razorpay to gather method information
        const paymentData = await razorpayService.fetchPaymentDetails(razorpay_payment_id);
        const method = paymentData?.method || 'unknown';
        const methodDetails = {
            vpa: paymentData?.vpa,
            bank: paymentData?.bank,
            wallet: paymentData?.wallet,
            cardLast4: paymentData?.card?.last4,
            cardNetwork: paymentData?.card?.network,
            cardType: paymentData?.card?.type
        };

        // Step 3: Run idempotent ACID confirmation
        const { order, payment, alreadyProcessed } = await confirmPaymentAndFinalizeOrder({
            orderId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            method,
            methodDetails,
            source: 'client_verification'
        });

        // Step 4: Asynchronously generate invoice & send email (if not already processed)
        if (!alreadyProcessed) {
            (async () => {
                try {
                    const fullUser = await User.findById(order.user);
                    if (fullUser) {
                        const invoiceBuffer = await generateInvoicePDF(order, payment);
                        await sendOrderPlacedEmail(fullUser, order, invoiceBuffer);
                    }
                } catch (emailErr) {
                    console.error('⚠️ Post-payment email/invoice error:', emailErr);
                }
            })();
        }

        res.json({
            success: true,
            message: 'Payment verified and order confirmed successfully',
            orderId: order._id,
            invoiceNumber: order.invoiceNumber,
            status: order.status
        });
    } catch (error) {
        console.error('❌ Payment Verification Error:', error);
        res.status(500).json({ message: error.message || 'Payment verification failed' });
    }
};

// ==========================================
// 3. WEBHOOK HANDLER (Idempotent Event Processing)
// ==========================================
export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.rawBody;

        if (!signature || !rawBody) {
            return res.status(400).json({ message: 'Missing webhook signature or raw body' });
        }

        // 1. Verify Webhook Signature
        const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            console.error('🚨 Invalid Razorpay Webhook Signature');
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = req.body;
        const eventId = req.headers['x-razorpay-event-id'] || event.event_id || `${event.event}_${Date.now()}`;
        const eventType = event.event;
        const payload = event.payload;

        console.log(`🔔 Webhook received: [${eventType}] ID: ${eventId}`);

        // 2. Identify payment / order from event
        const paymentEntity = payload?.payment?.entity;
        const razorpayPaymentId = paymentEntity?.id;
        const razorpayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;

        if (razorpayOrderId) {
            // Check if this event was already logged on Payment record (Idempotency)
            const existingPayment = await Payment.findOne({ razorpayOrderId });
            if (existingPayment) {
                const alreadyHandled = existingPayment.webhookEventsReceived?.some(e => e.eventId === eventId);
                if (alreadyHandled) {
                    console.log(`ℹ️ [Webhook Idempotent] Event ${eventId} already processed.`);
                    return res.status(200).json({ status: 'ok', message: 'Event already processed' });
                }

                existingPayment.webhookEventsReceived.push({
                    eventId,
                    eventType,
                    timestamp: new Date()
                });
                await existingPayment.save();
            }
        }

        // 3. Process specific event types safely
        switch (eventType) {
            case 'payment.captured':
            case 'order.paid': {
                if (razorpayOrderId && razorpayPaymentId) {
                    const internalPayment = await Payment.findOne({ razorpayOrderId });
                    if (internalPayment && internalPayment.status !== 'CAPTURED') {
                        const method = paymentEntity?.method || 'unknown';
                        const methodDetails = {
                            vpa: paymentEntity?.vpa,
                            bank: paymentEntity?.bank,
                            wallet: paymentEntity?.wallet,
                            cardLast4: paymentEntity?.card?.last4,
                            cardNetwork: paymentEntity?.card?.network
                        };

                        const { order, payment } = await confirmPaymentAndFinalizeOrder({
                            orderId: internalPayment.order,
                            razorpayOrderId,
                            razorpayPaymentId,
                            method,
                            methodDetails,
                            source: 'webhook'
                        });

                        // Trigger invoice email if not already sent
                        try {
                            const fullUser = await User.findById(order.user);
                            if (fullUser) {
                                const invoiceBuffer = await generateInvoicePDF(order, payment);
                                await sendOrderPlacedEmail(fullUser, order, invoiceBuffer);
                            }
                        } catch (err) {
                            console.error('⚠️ Webhook invoice generation failed:', err);
                        }
                    }
                }
                break;
            }

            case 'payment.failed': {
                if (razorpayOrderId) {
                    await Payment.findOneAndUpdate(
                        { razorpayOrderId },
                        {
                            status: 'FAILED',
                            razorpayPaymentId,
                            errorDetails: {
                                code: paymentEntity?.error_code,
                                description: paymentEntity?.error_description,
                                source: paymentEntity?.error_source,
                                step: paymentEntity?.error_step,
                                reason: paymentEntity?.error_reason
                            }
                        }
                    );
                    console.log(`❌ Payment marked as FAILED for order ${razorpayOrderId}`);
                }
                break;
            }

            case 'refund.created':
            case 'refund.processed': {
                const refundEntity = payload?.refund?.entity;
                if (refundEntity && razorpayPaymentId) {
                    const payment = await Payment.findOne({ razorpayPaymentId });
                    if (payment) {
                        const refundAmount = refundEntity.amount / 100; // paise to INR
                        const existingRefund = payment.refunds.find(r => r.refundId === refundEntity.id);

                        if (!existingRefund) {
                            payment.refunds.push({
                                refundId: refundEntity.id,
                                amount: refundAmount,
                                status: refundEntity.status,
                                speed: refundEntity.speed_processed || 'normal',
                                notes: refundEntity.notes,
                                createdAt: new Date(refundEntity.created_at * 1000)
                            });
                        } else {
                            existingRefund.status = refundEntity.status;
                        }

                        const totalRefunded = payment.refunds
                            .filter(r => r.status === 'processed')
                            .reduce((sum, r) => sum + r.amount, 0);

                        payment.amountRefunded = totalRefunded;

                        if (totalRefunded >= payment.amount) {
                            payment.status = 'REFUNDED';
                            await Order.findByIdAndUpdate(payment.order, { status: 'REFUNDED' });
                        } else if (totalRefunded > 0) {
                            payment.status = 'PARTIALLY_REFUNDED';
                        }

                        await payment.save();
                        console.log(`✅ Refund processed for payment ${razorpayPaymentId}: ₹${refundAmount}`);
                    }
                }
                break;
            }

            default:
                console.log(`ℹ️ Unhandled webhook event: ${eventType}`);
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('❌ Webhook Processing Exception:', error);
        res.status(500).json({ message: 'Webhook processing error' });
    }
};

// ==========================================
// 4. REFUND CONTROLLER (Full & Partial - Admin Only)
// ==========================================
export const initiateRefund = async (req, res) => {
    try {
        const { paymentId, amount, reason } = req.body;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        const payment = await Payment.findById(paymentId).populate('order');
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        if (payment.status !== 'CAPTURED' && payment.status !== 'PARTIALLY_REFUNDED') {
            return res.status(400).json({
                message: `Cannot refund payment in "${payment.status}" status. Only CAPTURED payments can be refunded.`
            });
        }

        const remainingRefundable = payment.amount - (payment.amountRefunded || 0);
        const refundAmount = amount ? Number(amount) : remainingRefundable;

        if (refundAmount <= 0 || refundAmount > remainingRefundable) {
            return res.status(400).json({
                message: `Invalid refund amount. Maximum refundable is ₹${remainingRefundable}`
            });
        }

        if (!payment.razorpayPaymentId) {
            return res.status(400).json({ message: 'Missing Razorpay Payment ID on record' });
        }

        // Call Razorpay API
        const razorpayRefund = await razorpayService.createRefund({
            paymentId: payment.razorpayPaymentId,
            amountInInr: refundAmount,
            reason: reason || 'Customer/Admin requested refund',
            notes: {
                orderId: payment.order._id.toString(),
                adminUser: req.user._id.toString()
            }
        });

        // Store refund attempt in record
        payment.refunds.push({
            refundId: razorpayRefund.id,
            amount: refundAmount,
            status: razorpayRefund.status || 'processed',
            reason: reason || '',
            speed: razorpayRefund.speed_processed || 'normal',
            createdAt: new Date()
        });

        payment.amountRefunded = (payment.amountRefunded || 0) + refundAmount;
        if (payment.amountRefunded >= payment.amount) {
            payment.status = 'REFUNDED';
            await Order.findByIdAndUpdate(payment.order._id, { status: 'REFUNDED' });
        } else {
            payment.status = 'PARTIALLY_REFUNDED';
        }

        await payment.save();

        res.json({
            success: true,
            message: `Successfully processed refund of ₹${refundAmount}`,
            refund: razorpayRefund,
            payment
        });
    } catch (error) {
        console.error('❌ Refund Error:', error);
        res.status(500).json({ message: error.message || 'Refund processing failed' });
    }
};

// ==========================================
// 5. GET ALL PAYMENTS (Admin Panel)
// ==========================================
export const getAllPayments = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 100 } = req.query;
        const filter = {};

        if (status && status !== 'ALL') {
            const upper = status.toUpperCase();
            if (upper === 'PENDING') {
                // Payments in initiation phase start as CREATED, PENDING, or AUTHORIZED
                filter.status = { $in: ['CREATED', 'PENDING', 'AUTHORIZED'] };
            } else if (upper === 'CAPTURED' || upper === 'PAID') {
                filter.status = 'CAPTURED';
            } else if (upper === 'FAILED') {
                filter.status = 'FAILED';
            } else if (upper === 'REFUNDED') {
                filter.status = 'REFUNDED';
            } else if (upper === 'PARTIALLY_REFUNDED') {
                filter.status = { $in: ['PARTIALLY_REFUNDED', 'REFUND_PENDING'] };
            } else {
                filter.status = upper;
            }
        }

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { razorpayOrderId: searchRegex },
                { razorpayPaymentId: searchRegex }
            ];
        }

        // Calculate count breakdown across all categories for real-time badge counters
        const [totalCount, capturedCount, pendingCount, failedCount, refundedCount, partiallyRefundedCount] = await Promise.all([
            Payment.countDocuments(),
            Payment.countDocuments({ status: 'CAPTURED' }),
            Payment.countDocuments({ status: { $in: ['CREATED', 'PENDING', 'AUTHORIZED'] } }),
            Payment.countDocuments({ status: 'FAILED' }),
            Payment.countDocuments({ status: 'REFUNDED' }),
            Payment.countDocuments({ status: { $in: ['PARTIALLY_REFUNDED', 'REFUND_PENDING'] } })
        ]);

        const totalFiltered = await Payment.countDocuments(filter);
        const payments = await Payment.find(filter)
            .populate('order', 'totalPrice status shippingAddress createdAt invoiceNumber')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            payments,
            total: totalFiltered,
            counts: {
                ALL: totalCount,
                CAPTURED: capturedCount,
                PENDING: pendingCount,
                FAILED: failedCount,
                REFUNDED: refundedCount,
                PARTIALLY_REFUNDED: partiallyRefundedCount
            },
            page: Number(page),
            pages: Math.ceil(totalFiltered / Number(limit))
        });
    } catch (error) {
        console.error('❌ Fetch Payments Error:', error);
        res.status(500).json({ message: 'Failed to fetch payment records' });
    }
};

// ==========================================
// 6. GET PAYMENT BY ID
// ==========================================
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('order')
            .populate('user', 'name email phone');

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment details' });
    }
};

export default {
    createPaymentOrder,
    verifyPayment,
    handleWebhook,
    initiateRefund,
    getAllPayments,
    getPaymentById
};
