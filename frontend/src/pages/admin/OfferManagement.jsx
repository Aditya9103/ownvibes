import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff, Tag, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import SEO from '../../components/SEO';
import TableSkeleton from '../../components/skeletons/TableSkeleton';
import { API_BASE_URL } from '../../api';

const OfferManagement = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        description: '',
        isActive: true,
        visibleToAll: true
    });

    const [editingCoupon, setEditingCoupon] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const { data: coupons = [], isLoading: loading, isFetching, error, refetch } = useQuery({
        queryKey: ['adminCoupons'],
        queryFn: async () => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/coupons/admin`, config);
            return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingCoupon(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_BASE_URL}/coupons`, formData, config);
            setFormData({ code: '', discountPercentage: '', description: '', isActive: true, visibleToAll: true });
            queryClient.invalidateQueries(['adminCoupons']);
            queryClient.invalidateQueries(['offers']);
            toast.success('Offer created successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        }
    };

    // Quick toggle for "Visible to All" directly from table row
    const handleToggleVisibleToAll = async (coupon) => {
        const newVisible = !(coupon.visibleToAll !== false);
        try {
            setUpdatingId(coupon._id);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/coupons/${coupon._id}`, { visibleToAll: newVisible }, config);
            
            // Optimistic cache update
            queryClient.setQueryData(['adminCoupons'], old =>
                old ? old.map(c => c._id === coupon._id ? { ...c, visibleToAll: newVisible } : c) : []
            );
            queryClient.invalidateQueries(['offers']);
            toast.success(`Offer ${newVisible ? 'is now visible to all users' : 'is now hidden from public offers page'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update visibility');
        } finally {
            setUpdatingId(null);
        }
    };

    // Quick toggle for "Active Status" directly from table row
    const handleToggleActive = async (coupon) => {
        const newActive = !coupon.isActive;
        try {
            setUpdatingId(coupon._id);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/coupons/${coupon._id}`, { isActive: newActive }, config);
            
            queryClient.setQueryData(['adminCoupons'], old =>
                old ? old.map(c => c._id === coupon._id ? { ...c, isActive: newActive } : c) : []
            );
            queryClient.invalidateQueries(['offers']);
            toast.success(`Coupon marked as ${newActive ? 'Active' : 'Inactive'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update active status');
        } finally {
            setUpdatingId(null);
        }
    };

    // Full edit submission
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingCoupon) return;
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/coupons/${editingCoupon._id}`, editingCoupon, config);
            queryClient.invalidateQueries(['adminCoupons']);
            queryClient.invalidateQueries(['offers']);
            toast.success('Offer updated successfully!');
            setEditingCoupon(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update coupon');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`${API_BASE_URL}/coupons/${id}`, config);
                queryClient.invalidateQueries(['adminCoupons']);
                queryClient.invalidateQueries(['offers']);
                toast.success('Offer deleted successfully!');
            } catch (err) {
                toast.error('Failed to delete coupon');
            }
        }
    };

    if (error) return <div className="text-red-500 p-8">{error.message || 'Failed to load coupons'}</div>;

    return (
        <div className="space-y-6">
            <SEO title="Offer Management | OwnVibes Admin" />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Tag className="w-8 h-8 text-primary" /> Offer & Coupon Management
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Create promotional codes, toggle public visibility on the Offers page, and manage discounts.
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

            {/* Create Offer Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Create New Coupon
                </h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Coupon Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="e.g. SAVE20"
                            className="w-full bg-[#1c1c1c] border border-white/15 text-white rounded-xl px-4 py-2.5 uppercase font-mono font-bold focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Discount Percentage (%)</label>
                        <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                            required
                            min="1"
                            max="100"
                            placeholder="e.g. 20"
                            className="w-full bg-[#1c1c1c] border border-white/15 text-white rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Get 20% off your entire cart!"
                            className="w-full bg-[#1c1c1c] border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="md:col-span-2 grid sm:grid-cols-2 gap-4 pt-2">
                        {/* Active Checkbox */}
                        <label className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-5 h-5 mt-0.5 rounded accent-[#cf7e28] cursor-pointer"
                            />
                            <div>
                                <span className="text-white text-sm font-bold block">Active</span>
                                <span className="text-gray-400 text-xs">When active, users can enter and apply this coupon code at checkout.</span>
                            </div>
                        </label>

                        {/* Visible To All Checkbox */}
                        <label className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                            <input
                                type="checkbox"
                                name="visibleToAll"
                                checked={formData.visibleToAll}
                                onChange={handleChange}
                                className="w-5 h-5 mt-0.5 rounded accent-[#cf7e28] cursor-pointer"
                            />
                            <div>
                                <span className="text-white text-sm font-bold flex items-center gap-1.5">
                                    <Eye className="w-4 h-4 text-primary" /> Visible to All
                                </span>
                                <span className="text-gray-400 text-xs">When checked, this offer is publicly showcased on the Offers page for all users.</span>
                            </div>
                        </label>
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-dark font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition-transform active:scale-95 cursor-pointer">
                            <Plus size={18} /> Create Coupon
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            {loading ? (
                <TableSkeleton columns={6} rows={5} />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                    <table className="w-full text-left text-white text-sm">
                        <thead className="bg-white/10 text-gray-400 text-xs uppercase font-extrabold tracking-wider border-b border-white/10">
                            <tr>
                                <th className="p-4">Code</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Visible to All</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {coupons.map((coupon) => {
                                const isVisible = coupon.visibleToAll !== false;
                                return (
                                    <tr key={coupon._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono font-black text-primary text-base">
                                            {coupon.code}
                                        </td>
                                        <td className="p-4 font-bold text-white">
                                            <span className="px-2.5 py-1 bg-white/10 rounded-lg text-primary">
                                                {coupon.discountPercentage}% OFF
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300 max-w-xs">{coupon.description}</td>
                                        
                                        {/* Status Toggle in table */}
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(coupon)}
                                                disabled={updatingId === coupon._id}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                                                    coupon.isActive 
                                                        ? 'bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25' 
                                                        : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                                                }`}
                                                title="Click to toggle Active / Inactive"
                                            >
                                                {coupon.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>

                                        {/* Visible to All Toggle in table */}
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVisibleToAll(coupon)}
                                                disabled={updatingId === coupon._id}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                                                    isVisible
                                                        ? 'bg-primary/20 text-primary border-primary/40 hover:bg-primary/30 shadow-sm'
                                                        : 'bg-gray-500/15 text-gray-400 border-gray-500/20 hover:bg-gray-500/25'
                                                }`}
                                                title="Click to toggle visibility on public Offers page"
                                            >
                                                {isVisible ? (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5 text-primary" />
                                                        <span>Visible</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                                                        <span>Hidden</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        {/* Action buttons */}
                                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                            <button
                                                onClick={() => setEditingCoupon({ ...coupon, visibleToAll: isVisible })}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer inline-flex"
                                                title="Edit Coupon"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon._id)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer inline-flex"
                                                title="Delete Coupon"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">No coupons found. Create your first offer above!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* EDIT COUPON MODAL */}
            {editingCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-primary" /> Edit Coupon
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingCoupon(null)}
                                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={editingCoupon.code}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 uppercase font-mono font-bold focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Discount Percentage (%)</label>
                                <input
                                    type="number"
                                    name="discountPercentage"
                                    value={editingCoupon.discountPercentage}
                                    onChange={handleEditChange}
                                    required
                                    min="1"
                                    max="100"
                                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={editingCoupon.description}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <label className="flex items-start gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={editingCoupon.isActive}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 mt-0.5 rounded accent-[#cf7e28] cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-white text-xs font-bold block">Active</span>
                                        <span className="text-gray-400 text-[11px]">Can apply at checkout</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="visibleToAll"
                                        checked={editingCoupon.visibleToAll !== false}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 mt-0.5 rounded accent-[#cf7e28] cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-white text-xs font-bold block">Visible to All</span>
                                        <span className="text-gray-400 text-[11px]">Show on Offers page</span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingCoupon(null)}
                                    className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold text-dark bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
