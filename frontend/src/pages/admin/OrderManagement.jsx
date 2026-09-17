import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, CheckCircle, Clock, Truck, XCircle, ChevronDown, CreditCard, Download, Trash2, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../api';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const OrderManagement = () => {
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [trackingUpdate, setTrackingUpdate] = useState({ status: '', location: '', description: '' });
    const [editMode, setEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', phone: '', address: '', city: '', postalCode: '' });

    // Filter & Search states
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOrderDeletable = (status) => {
        const s = (status || '').toUpperCase();
        return ['PENDING', 'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'ORDER PLACED', 'CREATED', 'CANCELLED'].includes(s);
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
            toast.success('Invoice downloaded');
        } catch (err) {
            toast.error('Failed to download invoice');
        }
    };

    const { data: orders = [], isLoading: loading, isFetching, refetch } = useQuery({
        queryKey: ['adminOrders'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.get(`${API_BASE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;
        try {
            setIsDeleting(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.delete(`${API_BASE_URL}/orders/${orderToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Order #${orderToDelete._id.slice(-8).toUpperCase()} deleted successfully`);
            
            // Optimistically update React Query cache
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.filter(o => o._id !== orderToDelete._id) : []
            );
            queryClient.invalidateQueries(['adminPayments']);
            
            if (selectedOrder && selectedOrder._id === orderToDelete._id) {
                setShowDetailModal(false);
                setSelectedOrder(null);
            }
            setOrderToDelete(null);
        } catch (error) {
            console.error('Failed to delete order:', error);
            toast.error(error.response?.data?.message || 'Failed to delete order');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Invalidate to refetch immediately, or optimistic update
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.map(o => o._id === orderId ? { ...o, status: newStatus } : o) : old
            );
            
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAddTrackingUpdate = async (e) => {
        e.preventDefault();
        if (!trackingUpdate.status || !trackingUpdate.location) return;
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.post(`${API_BASE_URL}/orders/${selectedOrder._id}/tracking`, trackingUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.map(o => o._id === data._id ? data : o) : old
            );
            setSelectedOrder(data);
            setTrackingUpdate({ status: '', location: '', description: '' });
        } catch (error) {
            console.error('Error adding tracking update:', error);
        }
    };

    const handleEditSave = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const { data } = await axios.put(`${API_BASE_URL}/orders/${selectedOrder._id}/edit`, editFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            queryClient.setQueryData(['adminOrders'], old => 
                old ? old.map(o => o._id === data._id ? data : o) : old
            );
            setSelectedOrder(data);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating order details:', error);
        }
    };

    const getStatusColor = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'PAID':
                return 'text-green-400 bg-green-500/10 border border-green-500/20';
            case 'PENDING':
            case 'PENDING_PAYMENT':
            case 'PAYMENT_PROCESSING':
                return 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20';
            case 'PROCESSING':
                return 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
            case 'SHIPPED':
                return 'text-purple-400 bg-purple-500/10 border border-purple-500/20';
            case 'DELIVERED':
                return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
            case 'CANCELLED':
                return 'text-red-400 bg-red-500/10 border border-red-500/20';
            case 'REFUNDED':
                return 'text-pink-400 bg-pink-500/10 border border-pink-500/20';
            default:
                return 'text-white bg-gray-500/10';
        }
    };

    const filteredOrders = orders.filter(order => {
        // Status filter
        if (selectedStatus !== 'ALL') {
            const s = (order.status || '').toUpperCase();
            if (selectedStatus === 'PENDING') {
                if (!['PENDING', 'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'ORDER PLACED', 'CREATED'].includes(s)) return false;
            } else if (selectedStatus === 'PAID') {
                if (s !== 'PAID') return false;
            } else if (selectedStatus === 'CANCELLED') {
                if (s !== 'CANCELLED') return false;
            } else if (s !== selectedStatus.toUpperCase()) {
                return false;
            }
        }

        // Search query
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            order._id?.toLowerCase().includes(q) ||
            order.invoiceNumber?.toLowerCase().includes(q) ||
            order.shippingAddress?.name?.toLowerCase().includes(q) ||
            order.shippingAddress?.phone?.toLowerCase().includes(q) ||
            order.shippingAddress?.city?.toLowerCase().includes(q) ||
            order.user?.email?.toLowerCase().includes(q) ||
            order.user?.name?.toLowerCase().includes(q)
        );
    });

    const statusCounts = {
        ALL: orders.length,
        PENDING: orders.filter(o => ['PENDING', 'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'ORDER PLACED', 'CREATED'].includes((o.status || '').toUpperCase())).length,
        PAID: orders.filter(o => (o.status || '').toUpperCase() === 'PAID').length,
        PROCESSING: orders.filter(o => (o.status || '').toUpperCase() === 'PROCESSING').length,
        SHIPPED: orders.filter(o => (o.status || '').toUpperCase() === 'SHIPPED').length,
        DELIVERED: orders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED').length,
        CANCELLED: orders.filter(o => (o.status || '').toUpperCase() === 'CANCELLED').length,
    };

    return (
        <div className="space-y-6">
            <SEO title="Order Management | OwnVibes Admin" />

            {/* Header with Refresh */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Order Management</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                        Manage customer orders, track shipments, and delete pending or cancelled orders.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/10 transition-colors w-fit disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw className={`w-4 h-4 text-primary ${isFetching ? 'animate-spin' : ''}`} />
                    <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'ALL', label: 'All Orders', count: statusCounts.ALL },
                        { id: 'PENDING', label: 'Pending', count: statusCounts.PENDING },
                        { id: 'PAID', label: 'Paid', count: statusCounts.PAID },
                        { id: 'PROCESSING', label: 'Processing', count: statusCounts.PROCESSING },
                        { id: 'SHIPPED', label: 'Shipped', count: statusCounts.SHIPPED },
                        { id: 'DELIVERED', label: 'Delivered', count: statusCounts.DELIVERED },
                        { id: 'CANCELLED', label: 'Cancelled', count: statusCounts.CANCELLED }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedStatus(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                selectedStatus === tab.id
                                    ? 'bg-primary text-dark font-black shadow-md shadow-primary/25 scale-[1.02]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                                selectedStatus === tab.id
                                    ? 'bg-black/30 text-dark'
                                    : 'bg-white/10 text-gray-300'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative min-w-[280px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search Order ID, Customer, Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {loading ? (
                <TableSkeleton columns={6} rows={10} />
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <Truck className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-white font-bold text-lg">No orders found</h3>
                    <p className="text-gray-400 text-sm mt-1">No orders match the selected filter or search query.</p>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 text-xs font-extrabold uppercase tracking-wider border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredOrders.map((order) => {
                                const deletable = isOrderDeletable(order.status);
                                return (
                                    <tr key={order._id} className="text-white hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-primary">
                                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{order.shippingAddress?.name || 'Customer'}</div>
                                            <div className="text-xs text-gray-400">{order.shippingAddress?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-white text-base">₹{order.totalPrice}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                                            <button
                                                onClick={() => { 
                                                    setSelectedOrder(order); 
                                                    setEditFormData({
                                                        name: order.shippingAddress?.name || '',
                                                        phone: order.shippingAddress?.phone || '',
                                                        address: order.shippingAddress?.address || '',
                                                        city: order.shippingAddress?.city || '',
                                                        postalCode: order.shippingAddress?.postalCode || ''
                                                    });
                                                    setShowDetailModal(true); 
                                                    setEditMode(false);
                                                }}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all inline-flex cursor-pointer"
                                                title="View Order Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {deletable && (
                                                <button
                                                    onClick={() => setOrderToDelete(order)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all inline-flex cursor-pointer"
                                                    title={`Delete ${order.status} Order`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-dark-light border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">#{selectedOrder._id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {isOrderDeletable(selectedOrder.status) && (
                                    <button
                                        onClick={() => setOrderToDelete(selectedOrder)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Order
                                    </button>
                                )}
                                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                                    <ChevronDown className="w-6 h-6 rotate-180" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-white uppercase">Customer Info</h3>
                                        <button 
                                            onClick={() => setEditMode(!editMode)} 
                                            className="text-xs text-primary hover:underline font-bold"
                                        >
                                            {editMode ? 'Cancel Edit' : 'Edit'}
                                        </button>
                                    </div>
                                    <div className="text-white">
                                        {editMode ? (
                                            <div className="space-y-2 mt-2">
                                                <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Name" />
                                                <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Phone" />
                                                <input type="text" value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Address" />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" value={editFormData.city} onChange={e => setEditFormData({...editFormData, city: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="City" />
                                                    <input type="text" value={editFormData.postalCode} onChange={e => setEditFormData({...editFormData, postalCode: e.target.value})} className="w-full bg-dark border border-white/10 rounded px-2 py-1 text-sm outline-none" placeholder="Postal Code" />
                                                </div>
                                                <button onClick={handleEditSave} className="w-full mt-2 bg-primary text-dark font-bold text-xs py-1.5 rounded hover:bg-primary/90">Save Changes</button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-bold text-lg">{selectedOrder.shippingAddress?.name}</p>
                                                <p>{selectedOrder.shippingAddress?.phone}</p>
                                                <p className="text-sm text-white">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                                                <p className="text-sm text-gray-400">PIN: {selectedOrder.shippingAddress?.postalCode}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-white uppercase">Order Status</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['PAID', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map((status) => {
                                            const isSelected = (selectedOrder.status || '').toUpperCase() === status.toUpperCase();
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => handleUpdateStatus(selectedOrder._id, status)}
                                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                                        isSelected
                                                            ? 'bg-primary text-dark font-black shadow-md'
                                                            : 'bg-white/5 text-white hover:bg-white/10'
                                                    }`}
                                                >
                                                    {status}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Payment & Invoice Section */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary" /> Payment & Financials
                                    </h3>
                                    <button
                                        onClick={() => handleDownloadInvoice(selectedOrder._id, selectedOrder.invoiceNumber)}
                                        className="flex items-center gap-1.5 text-xs text-primary hover:underline font-bold cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Download Tax Invoice
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-400 block mb-0.5">Method:</span>
                                        <span className="font-bold text-white uppercase">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block mb-0.5">Paid Amount:</span>
                                        <span className="font-bold text-white">₹{selectedOrder.totalPrice}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block mb-0.5">Payment Status:</span>
                                        <span className={`font-bold uppercase ${selectedOrder.isPaid || selectedOrder.status === 'PAID' ? 'text-green-400' : 'text-amber-400'}`}>
                                            {selectedOrder.isPaid || selectedOrder.status === 'PAID' ? 'PAID / CAPTURED' : 'PENDING'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block mb-0.5">Invoice No:</span>
                                        <span className="font-mono text-gray-300">{selectedOrder.invoiceNumber || 'N/A'}</span>
                                    </div>
                                    {selectedOrder.razorpayOrderId && (
                                        <div className="col-span-2">
                                            <span className="text-gray-400 block mb-0.5">Razorpay Order ID:</span>
                                            <span className="font-mono text-gray-300">{selectedOrder.razorpayOrderId}</span>
                                        </div>
                                    )}
                                    {selectedOrder.razorpayPaymentId && (
                                        <div className="col-span-2">
                                            <span className="text-gray-400 block mb-0.5">Razorpay Payment ID:</span>
                                            <span className="font-mono text-gray-300">{selectedOrder.razorpayPaymentId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase">Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" decoding="async" />
                                                <div>
                                                    <div className="text-white font-bold">{item.name}</div>
                                                    <div className="text-xs text-white">Qty: {item.qty} × ₹{item.price}</div>
                                                    {(item.size || item.color) && (
                                                        <div className="text-xs text-primary mt-0.5">
                                                            {item.size && <span>Size: {item.size}</span>}
                                                            {item.size && item.color && <span className="mx-1">•</span>}
                                                            {item.color && <span>Color: {item.color}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-white font-bold">₹{item.qty * item.price}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tracking Updates Section */}
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <h3 className="text-sm font-bold text-white uppercase">Tracking Updates</h3>
                                <div className="space-y-3 mb-4">
                                    {selectedOrder.trackingUpdates && selectedOrder.trackingUpdates.length > 0 ? (
                                        selectedOrder.trackingUpdates.map((update, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-primary text-sm">{update.status}</span>
                                                    <span className="text-xs text-gray-400">{new Date(update.date).toLocaleString()}</span>
                                                </div>
                                                <div className="text-sm text-white mb-1">📍 {update.location}</div>
                                                {update.description && <div className="text-xs text-gray-400">{update.description}</div>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No tracking updates yet.</p>
                                    )}
                                </div>
                                <form onSubmit={handleAddTrackingUpdate} className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <h4 className="text-xs font-bold text-white uppercase">Add New Update</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="Status (e.g. Shipped, In Transit)" 
                                            required 
                                            className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                                            value={trackingUpdate.status}
                                            onChange={e => setTrackingUpdate({...trackingUpdate, status: e.target.value})}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Location (e.g. Mumbai Hub)" 
                                            required 
                                            className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                                            value={trackingUpdate.location}
                                            onChange={e => setTrackingUpdate({...trackingUpdate, location: e.target.value})}
                                        />
                                    </div>
                                    <textarea 
                                        placeholder="Description (Optional)" 
                                        className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none resize-none h-16"
                                        value={trackingUpdate.description}
                                        onChange={e => setTrackingUpdate({...trackingUpdate, description: e.target.value})}
                                    />
                                    <button type="submit" className="w-full bg-primary text-dark font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm cursor-pointer">
                                        Add Tracking Update
                                    </button>
                                </form>
                            </div>
                            
                            <div className="flex justify-between items-center p-4 pt-6 border-t border-white/10">
                                <div className="text-xl font-bold text-white">Total Amount</div>
                                <div className="text-2xl font-black text-primary">₹{selectedOrder.totalPrice}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {orderToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1c1c1c] border border-red-500/20 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-400">
                            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Delete Order?</h3>
                                <p className="text-xs text-gray-400 font-mono">
                                    #{orderToDelete._id.slice(-8).toUpperCase()} • Status: <span className="uppercase font-bold text-amber-400">{orderToDelete.status}</span>
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-300">
                            Are you sure you want to permanently delete this order? Any reserved inventory will be restored and associated transaction records will be removed.
                        </p>

                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-gray-400 space-y-1">
                            <p><span className="text-gray-500">Customer:</span> <strong className="text-white">{orderToDelete.shippingAddress?.name}</strong></p>
                            <p><span className="text-gray-500">Amount:</span> <strong className="text-white">₹{orderToDelete.totalPrice}</strong></p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setOrderToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteOrder}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
