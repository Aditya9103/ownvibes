import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, MapPin, LogOut, Package, Edit2, Plus, Trash2, Check, ShieldCheck, Loader2, Save } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import ButtonLoader from '../components/ButtonLoader';
import { clearUserCache } from '../pwa/registerSW';
import { clearAllOfflineData } from '../offline/db';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [userInfo, setUserInfo] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [addressForm, setAddressForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        isDefault: false
    });

    const token = localStorage.getItem('userToken');

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser || !token) {
            navigate('/login?redirect=/profile');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);

        // Fetch addresses from backend
        const fetchAddresses = async () => {
            try {
                setLoadingAddresses(true);
                const { data } = await axios.get(`${API_BASE_URL}/auth/addresses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const list = Array.isArray(data) ? data : [];
                setAddresses(list);

                // Ensure local storage has a default shipping address if available
                if (list.length > 0) {
                    const def = list.find(a => a.isDefault) || list[0];
                    localStorage.setItem('shippingAddress', JSON.stringify(def));
                }
            } catch (err) {
                console.error('Failed to fetch addresses:', err);
                const local = localStorage.getItem('shippingAddress');
                if (local) {
                    try {
                        const parsed = JSON.parse(local);
                        setAddresses([parsed]);
                    } catch (e) {}
                }
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [navigate, token]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
        clearCart();
        clearUserCache();
        clearAllOfflineData();
        navigate('/');
    };

    const handleOpenAdd = () => {
        setEditingAddressId(null);
        setAddressForm({
            name: userInfo?.name || '',
            email: userInfo?.email || '',
            phone: userInfo?.phone || '',
            address: '',
            city: '',
            postalCode: '',
            isDefault: addresses.length === 0
        });
        setError('');
        setIsEditingAddress(true);
    };

    const handleOpenEdit = (addr) => {
        setEditingAddressId(addr._id);
        setAddressForm({
            name: addr.name || addr.fullName || '',
            email: addr.email || userInfo?.email || '',
            phone: addr.phone || '',
            address: addr.address || '',
            city: addr.city || '',
            postalCode: addr.postalCode || addr.pincode || '',
            isDefault: !!addr.isDefault
        });
        setError('');
        setIsEditingAddress(true);
    };

    const handleSetDefault = async (addressId) => {
        try {
            const { data } = await axios.patch(`${API_BASE_URL}/auth/addresses/${addressId}/default`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = data.addresses || [];
            setAddresses(updated);
            const def = updated.find(a => a.isDefault) || updated[0];
            if (def) {
                localStorage.setItem('shippingAddress', JSON.stringify(def));
            }
        } catch (err) {
            console.error('Failed to set default address:', err);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            const { data } = await axios.delete(`${API_BASE_URL}/auth/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = data.addresses || [];
            setAddresses(updated);
            if (updated.length > 0) {
                const def = updated.find(a => a.isDefault) || updated[0];
                localStorage.setItem('shippingAddress', JSON.stringify(def));
            } else {
                localStorage.removeItem('shippingAddress');
            }
        } catch (err) {
            console.error('Failed to delete address:', err);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingAddressId) {
                const { data } = await axios.put(`${API_BASE_URL}/auth/addresses/${editingAddressId}`, addressForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const updated = data.addresses || [];
                setAddresses(updated);
                const def = updated.find(a => a.isDefault) || updated[0];
                if (def) {
                    localStorage.setItem('shippingAddress', JSON.stringify(def));
                }
            } else {
                const { data } = await axios.post(`${API_BASE_URL}/auth/addresses`, addressForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const updated = data.addresses || [];
                setAddresses(updated);
                const def = updated.find(a => a.isDefault) || updated[updated.length - 1];
                if (def) {
                    localStorage.setItem('shippingAddress', JSON.stringify(def));
                }
            }
            setIsEditingAddress(false);
            setEditingAddressId(null);
        } catch (err) {
            console.error('Failed to save address:', err);
            setError(err.response?.data?.message || 'Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    if (!userInfo) return null;

    return (
        <div className="min-h-screen bg-[#fdfaf7] pt-12 pb-20 font-sans">
            <SEO title="My Profile | Ownvibes" noindex={true} />
            <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] mb-3 tracking-tight">
                        My <span className="text-[#cf7e28]">Profile</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your personal details, delivery addresses, and orders.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-[24px] p-8 border border-[#f5eadb] shadow-sm text-center relative overflow-hidden group hover:shadow-md hover:border-[#cf7e28]/30 transition-all duration-300">
                            <div className="w-24 h-24 bg-[#fbf9f6] rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-sm mb-6 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                <User className="w-10 h-10 text-[#cf7e28]" />
                            </div>
                            <h2 className="text-2xl font-black text-[#1c1c1c] mb-1 relative z-10">{userInfo.name}</h2>
                            <p className="text-gray-500 text-[13px] font-bold flex items-center justify-center gap-2 relative z-10">
                                <Mail className="w-4 h-4" /> {userInfo.email}
                            </p>
                            {userInfo.phone && (
                                <p className="text-gray-500 text-[13px] font-bold flex items-center justify-center gap-2 relative z-10 mt-1">
                                    <MapPin className="w-4 h-4" /> {userInfo.phone}
                                </p>
                            )}

                            {/* Decorative background elements */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#cf7e28]/5 rounded-full blur-2xl group-hover:bg-[#cf7e28]/10 transition-colors duration-500"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#cf7e28]/5 rounded-full blur-2xl group-hover:bg-[#cf7e28]/10 transition-colors duration-500"></div>
                        </div>

                        <div className="bg-white rounded-[24px] p-4 border border-[#f5eadb] shadow-sm">
                            <button
                                onClick={() => navigate('/my-orders')}
                                className="w-full flex items-center gap-4 p-4 hover:bg-[#fbf9f6] rounded-xl transition-all duration-300 text-left group"
                            >
                                <div className="bg-[#fbf5f2] p-3 rounded-xl text-[#cf7e28] group-hover:bg-[#cf7e28] group-hover:text-white transition-colors duration-300">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1c1c1c]">My Orders</h3>
                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">View and track</p>
                                </div>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 p-4 hover:bg-red-50 rounded-xl transition-all duration-300 text-left mt-2 group"
                            >
                                <div className="bg-red-50 p-3 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-500">Logout</h3>
                                    <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider mt-0.5">Sign out of account</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <div className="bg-white rounded-[24px] p-8 border border-[#f5eadb] shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-xl font-bold text-[#1c1c1c] mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
                                <div className="w-8 h-8 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28]">
                                    <User className="w-4 h-4" />
                                </div>
                                Personal Information
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="group">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</p>
                                    <p className="text-[#1c1c1c] font-bold bg-[#fbf9f6] px-5 py-4 rounded-xl border border-transparent group-hover:border-[#f5eadb] group-hover:bg-white transition-all duration-300">{userInfo.name}</p>
                                </div>
                                <div className="group">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</p>
                                    <p className="text-[#1c1c1c] font-bold bg-[#fbf9f6] px-5 py-4 rounded-xl border border-transparent group-hover:border-[#f5eadb] group-hover:bg-white transition-all duration-300">{userInfo.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Addresses */}
                        <div className="bg-white rounded-[24px] p-8 border border-[#f5eadb] shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                                <h3 className="text-xl font-bold text-[#1c1c1c] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#fbf5f2] flex items-center justify-center text-[#cf7e28]">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    Saved Delivery Addresses
                                </h3>
                                {!isEditingAddress && (
                                    <button
                                        onClick={handleOpenAdd}
                                        className="text-[#cf7e28] hover:text-[#b58145] font-bold text-sm flex items-center gap-1.5 transition-colors bg-[#cf7e28]/10 px-3.5 py-2 rounded-xl"
                                    >
                                        <Plus size={16} /> Add Address
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-3.5 rounded-xl mb-5 text-center">
                                    {error}
                                </div>
                            )}

                            {isEditingAddress ? (
                                <form onSubmit={handleSaveAddress} className="space-y-4">
                                    <div className="flex justify-between items-center pb-2">
                                        <h4 className="font-extrabold text-[#1c1c1c]">
                                            {editingAddressId ? 'Edit Address' : 'Add New Address'}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingAddress(false)}
                                            className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                                            <input required type="text" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="Name" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone / WhatsApp</label>
                                            <input required type="text" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="Phone" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Street Address</label>
                                        <textarea required rows="2" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none resize-none" placeholder="Street Address, Area, Landmark" />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">City</label>
                                            <input required type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="City" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Postal Code</label>
                                            <input required type="text" maxLength="6" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="w-full bg-[#fbf9f6] border border-[#f5eadb] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1c1c1c] focus:border-[#cf7e28] outline-none" placeholder="Postal Code" />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={addressForm.isDefault}
                                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                            className="w-4 h-4 text-[#cf7e28] rounded border-gray-300 focus:ring-[#cf7e28]"
                                        />
                                        <span className="text-xs font-bold text-gray-700">Set as default delivery address</span>
                                    </label>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => setIsEditingAddress(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                                        <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#cf7e28] hover:bg-[#b58145] text-white flex items-center gap-2 transition-colors shadow-md shadow-[#cf7e28]/20 disabled:opacity-80">
                                            {submitting ? <ButtonLoader text="Saving..." /> : <><Save size={16} /> Save Address</>}
                                        </button>
                                    </div>
                                </form>
                            ) : loadingAddresses ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-6 h-6 text-[#cf7e28] animate-spin mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-bold">Loading addresses...</p>
                                </div>
                            ) : addresses.length > 0 ? (
                                <div className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                                addr.isDefault
                                                    ? 'bg-[#fffbf6] border-[#cf7e28] shadow-sm'
                                                    : 'bg-[#fbf9f6] border-[#f5eadb] hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <span className="text-[#1c1c1c] font-black text-base">
                                                            {addr.name || userInfo.name}
                                                        </span>
                                                        {addr.isDefault && (
                                                            <span className="bg-[#cf7e28] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 font-medium text-xs mb-1">
                                                        <span className="font-bold text-[#1c1c1c]">Phone:</span> {addr.phone}
                                                    </p>
                                                    <p className="text-gray-600 font-medium leading-relaxed text-xs">
                                                        {addr.address}<br />
                                                        {addr.city}, {addr.postalCode || addr.pincode}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefault(addr._id)}
                                                            className="text-xs font-bold text-gray-500 hover:text-[#cf7e28] px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#cf7e28] transition-colors"
                                                            title="Set as default"
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleOpenEdit(addr)}
                                                        className="p-1.5 text-gray-400 hover:text-[#cf7e28] hover:bg-[#cf7e28]/10 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr._id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-[#fbf9f6] rounded-xl border border-dashed border-gray-200">
                                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-[#1c1c1c] font-bold mb-1">No address saved yet</p>
                                    <p className="text-[13px] font-medium text-gray-500 max-w-[280px] mx-auto mb-4">
                                        Add a permanent delivery address to speed up your checkout process.
                                    </p>
                                    <button
                                        onClick={handleOpenAdd}
                                        className="inline-flex items-center gap-1.5 bg-[#cf7e28] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#b58145] transition-colors"
                                    >
                                        <Plus size={14} /> Add Address
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
