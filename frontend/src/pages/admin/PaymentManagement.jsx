import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, RotateCcw, Search, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, CreditCard, Download, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const PaymentManagement = () => {
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundType, setRefundType] = useState('full'); // 'full' or 'partial'
    const [processingRefund, setProcessingRefund] = useState(false);

    const { data: paymentsData, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['adminPayments', selectedStatus],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const statusParam = selectedStatus !== 'ALL' ? `?status=${selectedStatus}&limit=100` : '?limit=100';
            const { data } = await axios.get(`${API_BASE_URL}/payment${statusParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        staleTime: 15 * 1000
    });

    const payments = paymentsData?.payments || [];
    const counts = paymentsData?.counts || {};

    const filteredPayments = payments.filter(p => {
        // Status filter guard (ensures CREATED/PENDING/AUTHORIZED are mapped to PENDING)
        if (selectedStatus !== 'ALL') {
            if (selectedStatus === 'PENDING') {
                if (!['CREATED', 'PENDING', 'AUTHORIZED'].includes(p.status)) return false;
            } else if (selectedStatus === 'CAPTURED') {
                if (p.status !== 'CAPTURED') return false;
            } else if (selectedStatus === 'FAILED') {
                if (p.status !== 'FAILED') return false;
            } else if (selectedStatus === 'REFUNDED') {
                if (p.status !== 'REFUNDED') return false;
            } else if (selectedStatus === 'PARTIALLY_REFUNDED') {
                if (!['PARTIALLY_REFUNDED', 'REFUND_PENDING'].includes(p.status)) return false;
            }
        }

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.razorpayPaymentId?.toLowerCase().includes(q) ||
            p.razorpayOrderId?.toLowerCase().includes(q) ||
            p.order?._id?.toLowerCase().includes(q) ||
            p.order?.invoiceNumber?.toLowerCase().includes(q) ||
            p.user?.name?.toLowerCase().includes(q) ||
            p.user?.email?.toLowerCase().includes(q) ||
            p.user?.phone?.toLowerCase().includes(q) ||
            p.order?.shippingAddress?.name?.toLowerCase().includes(q) ||
            p.order?.shippingAddress?.phone?.toLowerCase().includes(q)
        );
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'CAPTURED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20"><CheckCircle className="w-3 h-3" /> Captured / Paid</span>;
            case 'CREATED':
            case 'PENDING':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20"><Clock className="w-3 h-3" /> Pending</span>;
            case 'FAILED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20"><XCircle className="w-3 h-3" /> Failed</span>;
            case 'REFUNDED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20"><RotateCcw className="w-3 h-3" /> Refunded</span>;
            case 'PARTIALLY_REFUNDED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20"><AlertCircle className="w-3 h-3" /> Part. Refunded</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-500/10">{status}</span>;
        }
    };

    const handleOpenRefundModal = (payment) => {
        setSelectedPayment(payment);
        const maxRefund = payment.amount - (payment.amountRefunded || 0);
        setRefundAmount(maxRefund.toString());
        setRefundType('full');
        setRefundReason('');
        setShowRefundModal(true);
    };

    const handleExecuteRefund = async (e) => {
        e.preventDefault();
        if (!selectedPayment) return;

        const maxRefundable = selectedPayment.amount - (selectedPayment.amountRefunded || 0);
        const amountToRefund = refundType === 'full' ? maxRefundable : Number(refundAmount);

        if (amountToRefund <= 0 || amountToRefund > maxRefundable) {
            toast.error(`Invalid refund amount. Maximum refundable is ₹${maxRefundable}`);
            return;
        }

        try {
            setProcessingRefund(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');

            const { data } = await axios.post(`${API_BASE_URL}/payment/refund`, {
                paymentId: selectedPayment._id,
                amount: amountToRefund,
                reason: refundReason || 'Customer requested refund'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(data.message || `Refund of ₹${amountToRefund} processed successfully!`);
            setShowRefundModal(false);
            refetch();
            queryClient.invalidateQueries(['adminOrders']);
        } catch (error) {
            console.error('Refund Error:', error);
            toast.error(error.response?.data?.message || 'Failed to process refund');
        } finally {
            setProcessingRefund(false);
        }
    };

    const handleDownloadInvoice = async (orderId, invoiceNumber) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${invoiceNumber || orderId.slice(-8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Invoice downloaded successfully');
        } catch (err) {
            toast.error('Failed to download invoice');
        }
    };

    return (
        <div className="space-y-6">
            <SEO title="Payment Management | OwnVibes Admin" />

            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-[#cf7e28]" />
                        Payment Transactions
                    </h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                        Monitor live transactions, verify Razorpay IDs, and manage customer refunds.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/10 transition-colors w-fit disabled:opacity-60 cursor-pointer"
                >
                    <RefreshCw className={`w-4 h-4 text-[#cf7e28] ${isFetching ? 'animate-spin' : ''}`} />
                    <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'ALL', label: 'All Transactions', count: counts.ALL },
                        { id: 'CAPTURED', label: 'Paid / Captured', count: counts.CAPTURED },
                        { id: 'PENDING', label: 'Pending', count: counts.PENDING },
                        { id: 'FAILED', label: 'Failed', count: counts.FAILED },
                        { id: 'REFUNDED', label: 'Refunded', count: counts.REFUNDED },
                        { id: 'PARTIALLY_REFUNDED', label: 'Partially Refunded', count: counts.PARTIALLY_REFUNDED }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedStatus(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                selectedStatus === tab.id
                                    ? 'bg-[#cf7e28] text-white shadow-md shadow-[#cf7e28]/25 scale-[1.02]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span>{tab.label}</span>
                            {typeof tab.count === 'number' && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                                    selectedStatus === tab.id
                                        ? 'bg-black/35 text-white'
                                        : 'bg-white/10 text-gray-300'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative min-w-[280px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search Txn ID, Order, Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#cf7e28]"
                    />
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <TableSkeleton columns={7} rows={8} />
            ) : filteredPayments.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-white font-bold text-lg">No payment records found</h3>
                    <p className="text-gray-400 text-sm mt-1">No transactions match the selected filter or search query.</p>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 text-xs font-extrabold uppercase tracking-wider border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Order / Txn ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Payment Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredPayments.map((payment) => {
                                const maxRefund = payment.amount - (payment.amountRefunded || 0);
                                const isEligibleForRefund = (payment.status === 'CAPTURED' || payment.status === 'PARTIALLY_REFUNDED') && maxRefund > 0;

                                return (
                                    <tr key={payment._id} className="text-white hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-bold text-[#cf7e28]">
                                                #{payment.order?._id?.slice(-8)?.toUpperCase() || 'N/A'}
                                            </div>
                                            <div className="text-[11px] font-mono text-gray-400 mt-0.5" title="Razorpay Payment ID">
                                                {payment.razorpayPaymentId || payment.razorpayOrderId}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">
                                                {payment.user?.name || payment.order?.shippingAddress?.name || 'Customer'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {payment.user?.email || payment.order?.shippingAddress?.phone}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-black text-white text-base">₹{payment.amount}</div>
                                            {payment.amountRefunded > 0 && (
                                                <div className="text-[10px] text-purple-400 font-bold">
                                                    Refunded: ₹{payment.amountRefunded}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {payment.method && payment.method !== 'unknown' ? (
                                                <div className="uppercase font-bold text-xs text-white">
                                                    {payment.method}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-amber-400 font-medium italic">
                                                    Awaiting Checkout
                                                </div>
                                            )}
                                            {payment.methodDetails?.vpa && (
                                                <div className="text-[10px] text-gray-400 font-mono">UPI: {payment.methodDetails.vpa}</div>
                                            )}
                                            {payment.methodDetails?.cardLast4 && (
                                                <div className="text-[10px] text-gray-400 font-mono">Card: •••• {payment.methodDetails.cardLast4} ({payment.methodDetails?.cardNetwork || 'Card'})</div>
                                            )}
                                            {payment.methodDetails?.bank && (
                                                <div className="text-[10px] text-gray-400 font-mono">Bank: {payment.methodDetails.bank}</div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {getStatusBadge(payment.status)}
                                        </td>

                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                            <div className="text-[10px] text-gray-500">
                                                {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            {/* Details Button */}
                                            <button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setShowDetailModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex"
                                                title="View Transaction Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {/* Invoice Download */}
                                            {payment.order?._id && payment.status === 'CAPTURED' && (
                                                <button
                                                    onClick={() => handleDownloadInvoice(payment.order._id, payment.order.invoiceNumber)}
                                                    className="p-2 text-[#cf7e28] hover:bg-[#cf7e28]/10 rounded-lg transition-colors inline-flex"
                                                    title="Download Invoice"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Refund Button */}
                                            {isEligibleForRefund && (
                                                <button
                                                    onClick={() => handleOpenRefundModal(payment)}
                                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
                                                    title="Issue Full or Partial Refund"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" /> Refund
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DETAIL MODAL */}
            {showDetailModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-[#cf7e28]" />
                                    Transaction Details
                                </h2>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {selectedPayment._id}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-white font-bold p-1 rounded-lg hover:bg-white/10"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-gray-400 font-bold block mb-1">Razorpay Order ID</span>
                                <span className="font-mono text-white text-sm break-all">{selectedPayment.razorpayOrderId}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-gray-400 font-bold block mb-1">Razorpay Payment ID</span>
                                <span className="font-mono text-white text-sm">{selectedPayment.razorpayPaymentId || 'N/A (Unpaid)'}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-gray-400 font-bold block mb-1">Payment Status</span>
                                <div>{getStatusBadge(selectedPayment.status)}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-gray-400 font-bold block mb-1">Total Amount</span>
                                <span className="font-black text-white text-base">₹{selectedPayment.amount}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 sm:col-span-2">
                                <span className="text-gray-400 font-bold block mb-1">Payment Method</span>
                                {selectedPayment.method && selectedPayment.method !== 'unknown' ? (
                                    <div>
                                        <span className="font-bold text-white uppercase text-sm">{selectedPayment.method}</span>
                                        {selectedPayment.methodDetails?.vpa && (
                                            <p className="text-gray-400 text-xs font-mono mt-1">VPA / UPI ID: {selectedPayment.methodDetails.vpa}</p>
                                        )}
                                        {selectedPayment.methodDetails?.cardLast4 && (
                                            <p className="text-gray-400 text-xs font-mono mt-1">Card: •••• {selectedPayment.methodDetails.cardLast4} ({selectedPayment.methodDetails?.cardNetwork || 'Credit/Debit'})</p>
                                        )}
                                        {selectedPayment.methodDetails?.bank && (
                                            <p className="text-gray-400 text-xs font-mono mt-1">Netbanking: {selectedPayment.methodDetails.bank}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-amber-400/90 text-xs font-medium">
                                        ⏳ Awaiting Customer Selection (Customer hasn't paid yet via UPI / Card / Netbanking)
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                            <h4 className="font-bold text-gray-300 uppercase tracking-wider">Customer & Delivery</h4>
                            <div className="text-gray-300">
                                <p className="font-bold text-white text-sm">{selectedPayment.user?.name || selectedPayment.order?.shippingAddress?.name}</p>
                                <p>Email: {selectedPayment.user?.email || 'N/A'}</p>
                                <p>Phone: {selectedPayment.user?.phone || selectedPayment.order?.shippingAddress?.phone}</p>
                                {selectedPayment.order?.shippingAddress && (
                                    <p className="text-gray-400 mt-1">
                                        Address: {selectedPayment.order.shippingAddress.address}, {selectedPayment.order.shippingAddress.city} - {selectedPayment.order.shippingAddress.postalCode}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Refund History if any */}
                        {selectedPayment.refunds && selectedPayment.refunds.length > 0 && (
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                                <h4 className="font-bold text-gray-300 text-xs uppercase tracking-wider">Refund History</h4>
                                <div className="space-y-2">
                                    {selectedPayment.refunds.map((ref, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs bg-black/40 p-2.5 rounded-lg border border-white/5">
                                            <div>
                                                <div className="font-mono text-[#cf7e28] font-bold">{ref.refundId}</div>
                                                <div className="text-gray-500 text-[10px]">{new Date(ref.createdAt).toLocaleString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-white">₹{ref.amount}</div>
                                                <div className="text-green-400 text-[10px] uppercase font-bold">{ref.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error details if failed */}
                        {selectedPayment.errorDetails && selectedPayment.errorDetails.description && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs space-y-1">
                                <div className="flex items-center gap-2 text-red-400 font-bold">
                                    <ShieldAlert className="w-4 h-4" /> Failure Details
                                </div>
                                <p className="text-red-300">{selectedPayment.errorDetails.description}</p>
                                {selectedPayment.errorDetails.reason && (
                                    <p className="text-red-400/80 font-mono text-[11px]">Reason: {selectedPayment.errorDetails.reason}</p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REFUND MODAL */}
            {showRefundModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <form onSubmit={handleExecuteRefund} className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-red-400" />
                                Initiate Razorpay Refund
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowRefundModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Refund Summary Info */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                            <div className="flex justify-between text-gray-400">
                                <span>Total Paid:</span>
                                <span className="font-bold text-white">₹{selectedPayment.amount}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Already Refunded:</span>
                                <span className="font-bold text-white">₹{selectedPayment.amountRefunded || 0}</span>
                            </div>
                            <div className="flex justify-between text-[#cf7e28] font-bold pt-1 border-t border-white/5">
                                <span>Max Refundable:</span>
                                <span>₹{selectedPayment.amount - (selectedPayment.amountRefunded || 0)}</span>
                            </div>
                        </div>

                        {/* Refund Type Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-300 block">Refund Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRefundType('full');
                                        setRefundAmount((selectedPayment.amount - (selectedPayment.amountRefunded || 0)).toString());
                                    }}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                                        refundType === 'full'
                                            ? 'bg-red-500/20 border-red-500 text-red-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Full Refund (₹{selectedPayment.amount - (selectedPayment.amountRefunded || 0)})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRefundType('partial')}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                                        refundType === 'partial'
                                            ? 'bg-red-500/20 border-red-500 text-red-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    Partial Refund
                                </button>
                            </div>
                        </div>

                        {/* Partial Amount Input */}
                        {refundType === 'partial' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-300 block">Enter Refund Amount (₹)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedPayment.amount - (selectedPayment.amountRefunded || 0)}
                                    step="1"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#cf7e28]"
                                />
                            </div>
                        )}

                        {/* Reason */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 block">Reason for Refund</label>
                            <input
                                type="text"
                                placeholder="e.g., Customer cancellation / Size exchange"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#cf7e28]"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowRefundModal(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processingRefund}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {processingRefund ? 'Processing...' : 'Confirm Refund'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
