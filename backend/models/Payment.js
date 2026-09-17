import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
    refundId: { type: String, required: true },
    amount: { type: Number, required: true }, // in INR
    status: { type: String, default: 'processed' },
    speed: { type: String, default: 'normal' },
    reason: { type: String, default: '' },
    notes: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    razorpaySignature: {
        type: String
    },
    amount: {
        type: Number,
        required: true // in INR
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        required: true,
        enum: [
            'CREATED',
            'PENDING',
            'AUTHORIZED',
            'CAPTURED',
            'FAILED',
            'REFUND_PENDING',
            'REFUNDED',
            'PARTIALLY_REFUNDED'
        ],
        default: 'CREATED',
        index: true
    },
    method: {
        type: String, // 'upi', 'card', 'netbanking', 'wallet', 'emi'
        default: 'unknown'
    },
    methodDetails: {
        vpa: String,
        cardLast4: String,
        cardNetwork: String,
        cardType: String,
        bank: String,
        wallet: String
    },
    errorDetails: {
        code: String,
        description: String,
        source: String,
        step: String,
        reason: String
    },
    amountRefunded: {
        type: Number,
        default: 0
    },
    refunds: [refundSchema],
    idempotencyKey: {
        type: String,
        index: true
    },
    webhookEventsReceived: [
        {
            eventId: String,
            eventType: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
