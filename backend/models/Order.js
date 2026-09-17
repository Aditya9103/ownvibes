import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String },
            price: { type: Number, required: true },
            size: { type: String },
            color: { type: String },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'UPI', 'RAZORPAY']
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    razorpayOrderId: {
        type: String,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        index: true
    },
    invoiceNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    subtotal: {
        type: Number,
        default: 0.0
    },
    shippingFee: {
        type: Number,
        default: 0.0
    },
    taxAmount: {
        type: Number,
        default: 0.0
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    discountAmount: {
        type: Number,
        default: 0.0
    },
    couponCode: {
        type: String
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        default: 'PENDING_PAYMENT',
        enum: [
            'PENDING_PAYMENT',
            'PAYMENT_PROCESSING',
            'PAID',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
            'REFUNDED',
            // Legacy fallbacks
            'Pending',
            'Processing',
            'Shipped',
            'Delivered',
            'Cancelled'
        ]
    },
    trackingUpdates: [
        {
            status: { type: String, required: true },
            location: { type: String, required: true },
            date: { type: Date, default: Date.now },
            description: { type: String }
        }
    ]
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
