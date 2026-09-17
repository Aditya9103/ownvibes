import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import {
    CreditCard,
    Wallet,
    ArrowRight,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    Lock,
    Smartphone,
    MapPin,
    ChevronDown,
    ChevronUp,
    Zap,
    Truck
} from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import loadRazorpay from '../utils/loadRazorpay';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' or 'COD'
    const [paymentOption, setPaymentOption] = useState('UPI'); // 'UPI', 'CARD', 'COD'
    const [selectedUpiApp, setSelectedUpiApp] = useState('any'); // 'google_pay', 'phonepe', 'paytm', 'any'
    const [loading, setLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [showSummaryMobile, setShowSummaryMobile] = useState(false);
    const [shippingAddress, setShippingAddress] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login?redirect=/checkout/payment');
            return;
        }

        const savedAddr = JSON.parse(localStorage.getItem('shippingAddress'));
        if (!savedAddr) {
            navigate('/checkout/address');
            return;
        }
        setShippingAddress(savedAddr);

        // Preload Razorpay checkout SDK
        loadRazorpay();
    }, [navigate]);

    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalTotal = Math.max(0, cartTotal - discountAmount);
    const totalItemsCount = cartItems.reduce((acc, i) => acc + (i.qty || 1), 0);

    // Normalize Indian contact number for fast UPI Intent auto-matching in Razorpay
    const getFormattedPhone = () => {
        const raw = shippingAddress?.phone || '';
        const digits = raw.replace(/\D/g, '').slice(-10);
        return digits ? `+91${digits}` : '';
    };

    const handlePlaceOrder = async (overrideApp = null) => {
        if (loading) return; // Prevent duplicate clicks

        const token = localStorage.getItem('userToken');
        const activeAddress = shippingAddress || JSON.parse(localStorage.getItem('shippingAddress'));

        if (!activeAddress) {
            alert('Please provide a valid shipping address.');
            navigate('/checkout/address');
            return;
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const upiAppToUse = overrideApp || selectedUpiApp;

        // ==========================================
        // 1. ONLINE PAYMENT VIA RAZORPAY (UPI INTENT & MORE)
        // ==========================================
        if (paymentMethod === 'RAZORPAY') {
            try {
                setLoading(true);
                setProcessingMessage('Initiating secure UPI gateway...');

                const sdkLoaded = await loadRazorpay();
                if (!sdkLoaded) {
                    alert('Could not initialize payment gateway. Please check your internet connection.');
                    setLoading(false);
                    return;
                }

                // Step 1: Create Order on Backend (Server-Side validation)
                const createOrderPayload = {
                    orderItems: cartItems.map(item => ({
                        product: item._id,
                        name: item.name,
                        qty: item.qty,
                        image: (item.images && item.images.length > 0) ? item.images[0] : item.image,
                        size: item.selectedSize || '',
                        color: item.selectedColor || ''
                    })),
                    shippingAddress: activeAddress,
                    couponCode: appliedCoupon ? appliedCoupon.code : null
                };

                const { data } = await axios.post(`${API_BASE_URL}/payment/create-order`, createOrderPayload, {
                    headers
                });

                if (!data.success || !data.razorpayOrderId) {
                    throw new Error(data.message || 'Failed to initialize payment order');
                }

                setProcessingMessage('Opening UPI App / Checkout...');

                // Step 2: Configure Razorpay Checkout with Mobile UPI Intent Priority
                const upiAppsList = upiAppToUse && upiAppToUse !== 'any'
                    ? [upiAppToUse, 'google_pay', 'phonepe', 'paytm', 'bhim', 'cred']
                    : ['google_pay', 'phonepe', 'paytm', 'bhim', 'cred'];

                const options = {
                    key: data.keyId,
                    amount: Math.round(data.amount * 100),
                    currency: data.currency || 'INR',
                    name: 'Ownvibes',
                    description: `Order #${data.orderId.substring(data.orderId.length - 8).toUpperCase()}`,
                    image: 'https://www.ownvibes.in/logo.jpeg',
                    order_id: data.razorpayOrderId,
                    prefill: {
                        name: data.user?.name || activeAddress.name,
                        email: data.user?.email || '',
                        contact: getFormattedPhone() || data.user?.phone || activeAddress.phone
                    },
                    notes: {
                        orderId: data.orderId,
                        preferred_app: upiAppToUse
                    },
                    theme: {
                        color: '#cf7e28'
                    },
                    // Mobile UPI Intent Priority Configuration
                    config: {
                        display: {
                            blocks: {
                                upi: {
                                    name: 'Pay via UPI (Instant App Launch / QR)',
                                    instruments: [
                                        {
                                            method: 'upi',
                                            flows: ['intent', 'qr'],
                                            apps: upiAppsList
                                        }
                                    ]
                                },
                                other: {
                                    name: 'Cards, Netbanking & Wallets',
                                    instruments: [
                                        { method: 'card' },
                                        { method: 'netbanking' },
                                        { method: 'wallet' }
                                    ]
                                }
                            },
                            sequence: ['block.upi', 'block.other'],
                            preferences: {
                                show_default_blocks: true
                            }
                        }
                    },
                    handler: async function (response) {
                        try {
                            setLoading(true);
                            setProcessingMessage('Verifying payment signature with bank...');

                            // Step 3: Server Signature Verification & ACID confirmation
                            const verifyPayload = {
                                orderId: data.orderId,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            };

                            const verifyRes = await axios.post(`${API_BASE_URL}/payment/verify`, verifyPayload, {
                                headers
                            });

                            if (verifyRes.data.success) {
                                clearCart();
                                localStorage.removeItem('shippingAddress');
                                localStorage.removeItem('appliedCoupon');
                                navigate(`/checkout/success?id=${data.orderId}`);
                            } else {
                                alert(verifyRes.data.message || 'Payment verification was unsuccessful. Please check with your bank.');
                                setLoading(false);
                            }
                        } catch (verifyErr) {
                            console.error('Verification Error:', verifyErr);
                            alert(verifyErr.response?.data?.message || 'Payment verification issue. If amount was deducted, our team will confirm your order shortly.');
                            setLoading(false);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                            setProcessingMessage('');
                            console.log('Customer dismissed Razorpay Checkout');
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    console.error('Payment Failed Event:', response.error);
                    alert(`Payment Failed: ${response.error.description || 'Transaction declined by bank'}`);
                    setLoading(false);
                    setProcessingMessage('');
                });

                rzp.open();
            } catch (error) {
                console.error('Error starting Razorpay checkout:', error);
                alert(error.response?.data?.message || error.message || 'Failed to initiate payment. Please try again.');
                setLoading(false);
                setProcessingMessage('');
            }
            return;
        }

        // ==========================================
        // 2. CASH ON DELIVERY (COD)
        // ==========================================
        try {
            setLoading(true);
            setProcessingMessage('Placing Cash on Delivery order...');

            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150',
                    price: item.price,
                    product: item._id,
                    size: item.selectedSize,
                    color: item.selectedColor
                })),
                shippingAddress: activeAddress,
                paymentMethod: 'COD',
                totalPrice: finalTotal,
                discountAmount: discountAmount,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
            };

            const { data } = await axios.post(`${API_BASE_URL}/orders`, orderData, {
                headers
            });

            if (data.newUserToken && data.newUserInfo) {
                localStorage.setItem('userToken', data.newUserToken);
                localStorage.setItem('userInfo', JSON.stringify(data.newUserInfo));
            }

            clearCart();
            localStorage.removeItem('shippingAddress');
            localStorage.removeItem('appliedCoupon');
            navigate(`/checkout/success?id=${data._id}`);
        } catch (error) {
            console.error('Error placing COD order:', error);
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
            setProcessingMessage('');
        }
    };

    return (
        <div className="pt-6 sm:pt-8 md:pt-10 pb-28 sm:pb-16 min-h-screen bg-[#fdfaf7] px-3 sm:px-6 lg:px-8 font-sans">
            <SEO title="Secure Checkout Payment" noindex={true} />
            
            <div className="max-w-6xl mx-auto w-full">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/checkout/address')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#cf7e28] transition-colors mb-3 font-bold text-xs sm:text-sm active:scale-95"
                    disabled={loading}
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Delivery Address
                </button>

                {/* Page Title */}
                <div className="mb-5 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1c] tracking-tight">
                        Select <span className="text-[#cf7e28]">Payment Method</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                        Fast UPI intent, cards, netbanking & cash on delivery
                    </p>
                </div>

                {/* 2-COLUMN DESKTOP GRID / 1-COLUMN MOBILE STACK */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* ============================================================ */}
                    {/* LEFT COLUMN: PAYMENT OPTIONS & ADDRESS (lg:col-span-7)        */}
                    {/* ============================================================ */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Shipping Address Summary Bar */}
                        {shippingAddress && (
                            <div className="bg-white border border-[#f5eadb] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28] shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs font-bold text-[#1c1c1c] truncate">
                                            Deliver to: <span className="text-[#cf7e28]">{shippingAddress.name}</span> ({shippingAddress.city || 'Delhi'})
                                        </p>
                                        <p className="text-[11px] text-gray-500 truncate">
                                            {shippingAddress.address}, {shippingAddress.postalCode} • {shippingAddress.phone}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout/address')}
                                    className="text-[11px] font-bold text-[#cf7e28] hover:underline shrink-0 ml-2"
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* MOBILE-ONLY: PAYMENT OPTIONS (UPI, CARDS, COD)               */}
                        {/* ============================================================ */}
                        
                        {/* 1. FAST UPI INTENT APPS (MOBILE) */}
                        <div
                            onClick={() => {
                                if (!loading) {
                                    setPaymentOption('UPI');
                                    setPaymentMethod('RAZORPAY');
                                }
                            }}
                            className={`block sm:hidden bg-white border-2 rounded-2xl p-4 shadow-xl shadow-[#cf7e28]/5 transition-all ${
                                paymentOption === 'UPI'
                                    ? 'border-[#cf7e28] bg-[#fdfaf7]'
                                    : 'border-[#f5eadb] hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#cf7e28]/10 flex items-center justify-center text-[#cf7e28]">
                                        <Smartphone className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-[#1c1c1c]">Instant UPI Intent</h2>
                                </div>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-emerald-600" /> Fastest • 0% Fee
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                                Select your UPI app to open it directly with payment pre-filled:
                            </p>

                            {/* Quick UPI App Selectors */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {/* Google Pay */}
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentOption('UPI');
                                        setPaymentMethod('RAZORPAY');
                                        setSelectedUpiApp('google_pay');
                                    }}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                        paymentOption === 'UPI' && selectedUpiApp === 'google_pay'
                                            ? 'border-[#cf7e28] bg-white shadow-sm ring-1 ring-[#cf7e28]'
                                            : 'border-gray-100 bg-gray-50/70 hover:border-gray-200'
                                    }`}
                                >
                                    <span className="font-extrabold text-xs text-gray-800 tracking-tight flex items-center gap-1">
                                        <span className="text-[#4285F4]">G</span>
                                        <span className="text-[#EA4335]">P</span>
                                        <span className="text-[#FBBC05]">a</span>
                                        <span className="text-[#34A853]">y</span>
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-500">Google Pay</span>
                                </button>

                                {/* PhonePe */}
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentOption('UPI');
                                        setPaymentMethod('RAZORPAY');
                                        setSelectedUpiApp('phonepe');
                                    }}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                        paymentOption === 'UPI' && selectedUpiApp === 'phonepe'
                                            ? 'border-[#cf7e28] bg-white shadow-sm ring-1 ring-[#cf7e28]'
                                            : 'border-gray-100 bg-gray-50/70 hover:border-gray-200'
                                    }`}
                                >
                                    <span className="w-5 h-5 rounded-full bg-[#5f259f] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                                        पे
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-500">PhonePe</span>
                                </button>

                                {/* Paytm */}
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentOption('UPI');
                                        setPaymentMethod('RAZORPAY');
                                        setSelectedUpiApp('paytm');
                                    }}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                        paymentOption === 'UPI' && selectedUpiApp === 'paytm'
                                            ? 'border-[#cf7e28] bg-white shadow-sm ring-1 ring-[#cf7e28]'
                                            : 'border-gray-100 bg-gray-50/70 hover:border-gray-200'
                                    }`}
                                >
                                    <span className="text-xs font-black text-[#00b9f5] tracking-tight">
                                        Pay<span className="text-[#002e6e]">tm</span>
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-500">Paytm UPI</span>
                                </button>

                                {/* Any UPI / QR */}
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPaymentOption('UPI');
                                        setPaymentMethod('RAZORPAY');
                                        setSelectedUpiApp('any');
                                    }}
                                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                        paymentOption === 'UPI' && selectedUpiApp === 'any'
                                            ? 'border-[#cf7e28] bg-white shadow-sm ring-1 ring-[#cf7e28]'
                                            : 'border-gray-100 bg-gray-50/70 hover:border-gray-200'
                                    }`}
                                >
                                    <span className="text-[11px] font-extrabold text-[#cf7e28] uppercase tracking-wider">
                                        UPI
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-500">BHIM / Any</span>
                                </button>
                            </div>

                            {/* Confirmation Button for UPI */}
                            {paymentOption === 'UPI' && (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlaceOrder(selectedUpiApp);
                                    }}
                                    className="w-full bg-[#1c1c1c] hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md mt-1"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-[#cf7e28]" />
                                            <span className="text-xs font-semibold">{processingMessage || 'Opening UPI App...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 text-[#cf7e28] fill-[#cf7e28]" />
                                            <span className="text-xs font-bold">
                                                Pay ₹{finalTotal.toFixed(0)} via{' '}
                                                {selectedUpiApp === 'google_pay'
                                                    ? 'Google Pay'
                                                    : selectedUpiApp === 'phonepe'
                                                    ? 'PhonePe'
                                                    : selectedUpiApp === 'paytm'
                                                    ? 'Paytm'
                                                    : 'UPI Intent'}
                                            </span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* 2. CARDS, NETBANKING & WALLETS (MOBILE) */}
                        <div
                            onClick={() => {
                                if (!loading) {
                                    setPaymentOption('CARD');
                                    setPaymentMethod('RAZORPAY');
                                    setSelectedUpiApp('any');
                                }
                            }}
                            className={`block sm:hidden bg-white border-2 rounded-2xl p-4 shadow-xl shadow-[#cf7e28]/5 transition-all cursor-pointer ${
                                paymentOption === 'CARD'
                                    ? 'border-[#cf7e28] bg-[#fdfaf7]'
                                    : 'border-[#f5eadb] hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#cf7e28] shrink-0 shadow-xs">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-[#1c1c1c]">Debit / Credit Card & Netbanking</h4>
                                        <p className="text-[10px] text-gray-500 font-medium">Visa, Mastercard, RuPay, 50+ Banks, CRED, Wallets</p>
                                    </div>
                                </div>
                                {paymentOption === 'CARD' ? (
                                    <CheckCircle2 className="w-5 h-5 text-[#cf7e28] shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                                )}
                            </div>

                            {/* Dedicated Confirmation Button for Cards */}
                            {paymentOption === 'CARD' && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlaceOrder('any');
                                        }}
                                        className="w-full bg-[#1c1c1c] hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-[#cf7e28]" />
                                                <span className="text-xs font-semibold">{processingMessage || 'Opening Gateway...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4 text-[#cf7e28]" />
                                                <span className="text-xs font-bold">
                                                    Pay ₹{finalTotal.toFixed(0)} with Card / Netbanking
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. CASH ON DELIVERY (COD) (MOBILE) */}
                        <div
                            onClick={() => {
                                if (!loading) {
                                    setPaymentOption('COD');
                                    setPaymentMethod('COD');
                                }
                            }}
                            className={`block sm:hidden bg-white border-2 rounded-2xl p-4 shadow-xl shadow-[#cf7e28]/5 transition-all cursor-pointer ${
                                paymentOption === 'COD'
                                    ? 'border-[#cf7e28] bg-[#fdfaf7]'
                                    : 'border-[#f5eadb] hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#cf7e28] shrink-0 shadow-xs">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs sm:text-sm font-bold text-[#1c1c1c]">Cash On Delivery (COD)</h4>
                                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                                Pay on Delivery
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                            Pay in cash or UPI QR when your package arrives
                                        </p>
                                    </div>
                                </div>
                                {paymentOption === 'COD' ? (
                                    <CheckCircle2 className="w-5 h-5 text-[#cf7e28] shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" />
                                )}
                            </div>

                            {/* Dedicated Confirmation Button for COD */}
                            {paymentOption === 'COD' && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlaceOrder();
                                        }}
                                        className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-[#cf7e28]/20"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-xs font-bold">{processingMessage || 'Placing COD Order...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs font-extrabold">
                                                    Confirm Cash On Delivery Order (₹{finalTotal.toFixed(0)})
                                                </span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* DESKTOP-ONLY: STANDARD PAYMENT OPTIONS (HIDDEN ON MOBILE) */}
                        <div className="hidden sm:block bg-white border border-[#f5eadb] rounded-[24px] p-6 shadow-xl shadow-[#cf7e28]/5 space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                                Choose Payment Method
                            </h2>

                            {/* Razorpay Online Payment Option */}
                            <div
                                onClick={() => {
                                    if (!loading) {
                                        setPaymentMethod('RAZORPAY');
                                        setSelectedUpiApp('any');
                                    }
                                }}
                                className={`p-5 rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between ${
                                    paymentMethod === 'RAZORPAY'
                                        ? 'border-[#cf7e28] bg-[#fbf5f2]'
                                        : 'border-gray-100 bg-gray-50/70 hover:border-gray-200'
                                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#cf7e28] shadow-sm">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[#1c1c1c] font-bold text-base">Online Payment (Razorpay)</h3>
                                            <span className="bg-[#cf7e28]/10 text-[#cf7e28] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                                Recommended
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            Scan UPI QR Code with any app, or pay via Cards, Netbanking, CRED & Wallets
                                        </p>
                                    </div>
                                </div>
                                {paymentMethod === 'RAZORPAY' && <CheckCircle2 className="w-6 h-6 text-[#cf7e28] shrink-0" />}
                            </div>

                            {/* Cash on Delivery Option */}
                            <div
                                onClick={() => !loading && setPaymentMethod('COD')}
                                className={`p-5 rounded-[20px] border-2 transition-all cursor-pointer flex items-center justify-between ${
                                    paymentMethod === 'COD'
                                        ? 'border-[#cf7e28] bg-[#fbf5f2]'
                                        : 'border-gray-100 bg-gray-50/70 hover:border-gray-200'
                                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-[#1c1c1c] font-bold text-base">Cash On Delivery (COD)</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            Pay with cash or UPI QR when package arrives at your doorstep
                                        </p>
                                    </div>
                                </div>
                                {paymentMethod === 'COD' && <CheckCircle2 className="w-6 h-6 text-[#cf7e28] shrink-0" />}
                            </div>
                        </div>

                        {/* Trust & Safe Delivery Guarantees */}
                        <div className="bg-white border border-[#f5eadb] rounded-2xl p-4 flex items-center justify-around text-xs text-gray-600 font-medium">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>256-Bit SSL Secured</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#cf7e28]" />
                                <span>Free Doorstep Delivery</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>100% Buyer Protection</span>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* RIGHT COLUMN: ORDER SUMMARY & CHECKOUT CTA (lg:col-span-5)   */}
                    {/* ============================================================ */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                        {/* SECTION 3: ORDER SUMMARY & BREAKDOWN */}
                        <div className="bg-white border border-[#f5eadb] rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-xl shadow-[#cf7e28]/5">
                            <button
                                type="button"
                                onClick={() => setShowSummaryMobile(!showSummaryMobile)}
                                className="w-full flex items-center justify-between text-left pb-2 font-bold text-xs sm:text-sm text-gray-700"
                            >
                                <span className="font-extrabold text-sm sm:text-base text-[#1c1c1c]">Order Summary ({totalItemsCount} items)</span>
                                <div className="flex items-center gap-1 text-[#cf7e28]">
                                    <span className="font-extrabold text-sm">₹{finalTotal.toFixed(0)}</span>
                                    {showSummaryMobile ? <ChevronUp className="w-4 h-4 sm:hidden" /> : <ChevronDown className="w-4 h-4 sm:hidden" />}
                                </div>
                            </button>

                            {/* Item Previews (Collapsible on Mobile, expanded on Desktop) */}
                            <div className={`py-3 border-t border-gray-100 space-y-2 max-h-56 overflow-y-auto ${showSummaryMobile ? 'block' : 'hidden sm:block'}`}>
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs py-1.5">
                                        <div className="flex items-center gap-2.5 truncate pr-2">
                                            <img
                                                src={(item.images && item.images.length > 0) ? item.images[0] : item.image}
                                                alt={item.name}
                                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                                            />
                                            <div className="truncate">
                                                <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                                                <p className="text-[10px] text-gray-400">
                                                    Qty: {item.qty} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-700 shrink-0">
                                            ₹{((item.price || 0) * (item.qty || 1)).toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Details */}
                            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Gross Subtotal</span>
                                    <span className="font-semibold text-gray-700">₹{cartTotal.toFixed(0)}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600">
                                        <span className="font-semibold">Coupon Discount ({appliedCoupon?.code})</span>
                                        <span className="font-bold">-₹{discountAmount.toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Delivery Charges</span>
                                    <span className="font-bold text-emerald-600 uppercase text-xs">FREE</span>
                                </div>

                                <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                                    <div>
                                        <span className="text-gray-500 font-bold uppercase text-[11px] tracking-wider block">
                                            Total Payable
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            Includes 5% GST & free delivery
                                        </span>
                                    </div>
                                    <span className="text-2xl sm:text-3xl font-black text-[#1c1c1c]">
                                        ₹{finalTotal.toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            {/* Trust Badge Note */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium text-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>NPCI UPI Verified & 256-Bit SSL Encrypted</span>
                            </div>
                        </div>

                        {/* Desktop Pay Button */}
                        <div className="hidden sm:block">
                            <button
                                disabled={loading}
                                onClick={() => handlePlaceOrder()}
                                className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-lg shadow-[#cf7e28]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm font-bold">{processingMessage || 'Processing Payment...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {paymentMethod === 'RAZORPAY' ? (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                <span>Pay ₹{finalTotal.toFixed(0)} with Razorpay</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Confirm Cash On Delivery Order (₹{finalTotal.toFixed(0)})</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE STICKY BOTTOM CHECKOUT BAR (Thumb-friendly 1-Tap CTA) */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#f5eadb] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Final Amount
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-[#1c1c1c]">₹{finalTotal.toFixed(0)}</span>
                            <span className="text-[10px] text-emerald-600 font-bold">FREE DELIVERY</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => handlePlaceOrder(paymentOption === 'UPI' ? selectedUpiApp : 'any')}
                        className={`flex-1 max-w-[220px] text-white font-extrabold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md disabled:opacity-60 ${
                            paymentOption === 'COD'
                                ? 'bg-[#cf7e28] hover:bg-[#b56e22] shadow-[#cf7e28]/20'
                                : paymentOption === 'CARD'
                                ? 'bg-[#1c1c1c] hover:bg-black'
                                : 'bg-[#1c1c1c] hover:bg-black'
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                <span className="text-xs font-bold truncate">{processingMessage || 'Processing...'}</span>
                            </>
                        ) : (
                            <>
                                {paymentOption === 'COD' ? (
                                    <>
                                        <span className="text-xs font-black truncate">
                                            Place COD Order
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                    </>
                                ) : paymentOption === 'CARD' ? (
                                    <>
                                        <Lock className="w-3.5 h-3.5 text-[#cf7e28] shrink-0" />
                                        <span className="text-xs font-black truncate">
                                            Pay ₹{finalTotal.toFixed(0)} (Card)
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-3.5 h-3.5 fill-[#cf7e28] text-[#cf7e28] shrink-0" />
                                        <span className="text-xs font-black truncate">
                                            Pay ₹{finalTotal.toFixed(0)} (UPI)
                                        </span>
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
