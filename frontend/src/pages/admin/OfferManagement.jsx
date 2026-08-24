import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import SEO from '../../components/SEO';

const OfferManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        description: '',
        isActive: true
    });

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/coupons/admin', config);
            setCoupons(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load coupons');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('/api/coupons', formData, config);
            setFormData({ code: '', discountPercentage: '', description: '', isActive: true });
            fetchCoupons();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create coupon');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/api/coupons/${id}`, config);
                fetchCoupons();
            } catch (err) {
                alert('Failed to delete coupon');
            }
        }
    };

    if (loading) return <div className="text-white p-8">Loading...</div>;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    return (
    <div className="space-y-6">
      <SEO title="Offer Management" />
            <h1 className="text-3xl font-black text-white">Offer Management</h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Create New Coupon</h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white mb-1">Coupon Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="e.g. SAVE20"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 uppercase"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-1">Discount Percentage (%)</label>
                        <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                            required
                            min="1"
                            max="100"
                            placeholder="e.g. 20"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-white mb-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Get 20% off your entire order!"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
                        />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-4 h-4"
                        />
                        <label className="text-white">Active (Visible and usable)</label>
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-dark font-bold px-6 py-2 rounded-xl flex items-center gap-2">
                            <Plus size={20} /> Create Coupon
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-white">
                    <thead className="bg-white/10">
                        <tr>
                            <th className="p-4 font-bold">Code</th>
                            <th className="p-4 font-bold">Discount</th>
                            <th className="p-4 font-bold">Description</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon._id} className="border-t border-white/5">
                                <td className="p-4 font-black text-primary">{coupon.code}</td>
                                <td className="p-4">{coupon.discountPercentage}%</td>
                                <td className="p-4">{coupon.description}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${coupon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400">No coupons found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OfferManagement;
