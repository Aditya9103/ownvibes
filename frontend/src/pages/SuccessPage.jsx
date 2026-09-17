import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, Home, Download, Loader2, Clock, MapPin, Calendar, CreditCard } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';

const SuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('userToken');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const { data } = await axios.get(`${API_BASE_URL}/orders/${orderId}`, { headers });
                setOrder(data);
            } catch (err) {
                console.error('Error fetching order for success page:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleDownloadInvoice = async () => {
        if (!orderId) return;
        try {
            setDownloadingInvoice(true);
            const token = localStorage.getItem('userToken');
            const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${order?.invoiceNumber || orderId.slice(-8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice. Please try again or download from My Orders.');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf7] flex flex-col items-center justify-center pt-24 pb-16 px-4">
                <Loader2 className="w-10 h-10 text-[#cf7e28] animate-spin mb-4" />
                <p className="text-gray-600 font-bold text-lg">Confirming order details...</p>
            </div>
        );
    }

    const isPending = order && (order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_PROCESSING');

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf7] flex flex-col items-center justify-start pt-16 pb-20 px-4 font-sans">
            <SEO title="Order Confirmed" noindex={true} />

            {/* Icon Status */}
            <div className="relative mb-8">
                <div className={`absolute inset-0 ${isPending ? 'bg-amber-400/20' : 'bg-[#cf7e28]/20'} blur-2xl rounded-full animate-pulse`}></div>
                <div className="relative bg-white border border-[#f5eadb] p-6 rounded-full shadow-xl shadow-[#cf7e28]/10">
                    {isPending ? (
                        <Clock className="w-16 h-16 text-amber-500 animate-pulse" />
                    ) : (
                        <CheckCircle className="w-16 h-16 text-[#cf7e28]" />
                    )}
                </div>
            </div>

            {/* Header Text */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#1c1c1c] mb-2 tracking-tight text-center">
                {isPending ? (
                    <>Payment <span className="text-amber-500">Processing...</span></>
                ) : (
                    <>Order <span className="text-[#cf7e28]">Successful!</span></>
                )}
            </h1>

            <p className="text-gray-600 font-medium text-base md:text-lg mb-2 text-center max-w-md">
                {isPending
                    ? 'Your payment is currently being confirmed by the gateway. This page will update shortly.'
                    : 'Thank you for choosing Ownvibes! Your order has been placed and confirmed.'}
            </p>

            <p className="text-xs md:text-sm font-bold text-gray-400 mb-8 uppercase tracking-wider text-center">
                Order ID: #{orderId?.slice(-8).toUpperCase()} {order?.invoiceNumber ? `• Invoice: ${order.invoiceNumber}` : ''}
            </p>

            {/* Order Card Summary */}
            {order && (
                <div className="w-full max-w-xl bg-white border border-[#f5eadb] rounded-3xl p-6 md:p-8 shadow-xl shadow-[#cf7e28]/5 mb-8 text-left space-y-6">
                    
                    {/* Payment & Delivery Quick Info */}
                    <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-extrabold uppercase tracking-wider mb-1">
                                <CreditCard className="w-3.5 h-3.5 text-[#cf7e28]" /> Amount Paid
                            </div>
                            <div className="text-2xl font-black text-[#1c1c1c]">₹{order.totalPrice}</div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">Via {order.paymentMethod}</div>
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-extrabold uppercase tracking-wider mb-1">
                                <Calendar className="w-3.5 h-3.5 text-[#cf7e28]" /> Est. Delivery
                            </div>
                            <div className="text-base font-extrabold text-[#1c1c1c]">3 - 5 Business Days</div>
                            <div className="text-xs text-green-600 font-bold mt-0.5">Express Shipping</div>
                        </div>
                    </div>

                    {/* Products Purchased */}
                    <div>
                        <h3 className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mb-3">Items Summary</h3>
                        <div className="space-y-3">
                            {order.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                        <div>
                                            <p className="font-bold text-sm text-[#1c1c1c] leading-tight">{item.name}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                Qty: {item.qty} {item.size ? `• Size: ${item.size}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#1c1c1c]">₹{item.qty * item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.shippingAddress && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-extrabold uppercase tracking-widest mb-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#cf7e28]" /> Delivery Address
                            </div>
                            <p className="font-bold text-sm text-[#1c1c1c]">{order.shippingAddress.name} ({order.shippingAddress.phone})</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                            </p>
                        </div>
                    )}

                    {/* Download Invoice Button */}
                    {!isPending && (
                        <div className="pt-2">
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={downloadingInvoice}
                                className="w-full bg-[#fbf5f2] hover:bg-[#f5eadb] border border-[#f5eadb] text-[#cf7e28] font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 text-sm"
                            >
                                {downloadingInvoice ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating PDF Invoice...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download Official Tax Invoice (PDF)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-md">
                <button
                    onClick={() => navigate('/my-orders')}
                    className="flex-1 bg-white hover:bg-gray-50 border border-[#f5eadb] text-black font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                    <Package className="w-5 h-5 text-[#cf7e28]" />
                    View My Orders
                </button>
                <button
                    onClick={() => navigate('/shop')}
                    className="flex-1 bg-[#cf7e28] hover:bg-[#b56e22] text-white font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md shadow-[#cf7e28]/20"
                >
                    <Home className="w-5 h-5" />
                    Continue Shopping
                </button>
            </div>

            {/* Email Notice */}
            <div className="mt-8 p-4 bg-white border border-[#f5eadb] rounded-2xl max-w-md text-center shadow-sm">
                <p className="text-gray-500 font-medium text-xs leading-relaxed">
                    A confirmation email along with your tax invoice has been sent to your registered email address.
                </p>
            </div>
        </div>
    );
};

export default SuccessPage;
