import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { MapPin, Phone, User, ArrowRight, ArrowLeft, Mail, Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';
import ButtonLoader from '../components/ButtonLoader';

const AddressPage = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        postalCode: '',
        address: '',
        isDefault: false
    });

    const token = localStorage.getItem('userToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    // Fetch user addresses from server
    useEffect(() => {
        if (!token) {
            navigate('/login?redirect=/checkout/address');
            return;
        }

        if (cartItems.length === 0) {
            navigate('/cart');
            return;
        }

        const fetchAddresses = async () => {
            try {
                setLoadingAddresses(true);
                const { data } = await axios.get(`${API_BASE_URL}/auth/addresses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const fetchedList = Array.isArray(data) ? data : [];
                setAddresses(fetchedList);

                // Check localStorage for previously selected address
                const savedLocal = localStorage.getItem('shippingAddress');
                let initialSelected = null;

                if (savedLocal) {
                    try {
                        const parsed = JSON.parse(savedLocal);
                        initialSelected = fetchedList.find(a => a._id === parsed._id) ||
                            fetchedList.find(a => a.phone === parsed.phone && a.address === parsed.address) ||
                            null;
                    } catch (e) {
                        console.error('Error parsing local address:', e);
                    }
                }

                if (!initialSelected && fetchedList.length > 0) {
                    initialSelected = fetchedList.find(a => a.isDefault) || fetchedList[0];
                }

                if (initialSelected) {
                    setSelectedAddressId(initialSelected._id);
                    localStorage.setItem('shippingAddress', JSON.stringify(initialSelected));
                    setIsAddingNew(false);
                } else if (fetchedList.length === 0) {
                    // No address exists, show add new form
                    setIsAddingNew(true);
                    setFormData(prev => ({
                        ...prev,
                        name: userInfo.name || '',
                        email: userInfo.email || '',
                        phone: userInfo.phone || '',
                        isDefault: true
                    }));
                }
            } catch (err) {
                console.error('Failed to load addresses:', err);
                // Fallback to local storage if API fails
                const local = localStorage.getItem('shippingAddress');
                if (local) {
                    try {
                        const parsed = JSON.parse(local);
                        const fallbackAddr = { ...parsed, _id: parsed._id || 'local_1' };
                        setAddresses([fallbackAddr]);
                        setSelectedAddressId(fallbackAddr._id);
                    } catch (e) {}
                } else {
                    setIsAddingNew(true);
                }
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [cartItems, navigate, token]);

    // Select an existing address
    const handleSelectAddress = (addr) => {
        setSelectedAddressId(addr._id);
        localStorage.setItem('shippingAddress', JSON.stringify(addr));
    };

    // Continue to payment with selected address
    const handleProceedToPayment = () => {
        const selected = addresses.find(a => a._id === selectedAddressId);
        if (!selected) {
            setError('Please select or add a delivery address to continue');
            return;
        }
        localStorage.setItem('shippingAddress', JSON.stringify(selected));
        navigate('/checkout/payment');
    };

    // Open Add New Address form
    const handleOpenAdd = () => {
        setEditingAddressId(null);
        setFormData({
            name: userInfo.name || '',
            email: userInfo.email || '',
            phone: userInfo.phone || '',
            city: '',
            postalCode: '',
            address: '',
            isDefault: addresses.length === 0
        });
        setError('');
        setIsAddingNew(true);
    };

    // Open Edit Address form
    const handleOpenEdit = (addr, e) => {
        e.stopPropagation();
        setEditingAddressId(addr._id);
        setFormData({
            name: addr.name || '',
            email: addr.email || '',
            phone: addr.phone || '',
            city: addr.city || '',
            postalCode: addr.postalCode || '',
            address: addr.address || '',
            isDefault: !!addr.isDefault
        });
        setError('');
        setIsAddingNew(true);
    };

    // Delete an address
    const handleDeleteAddress = async (addressId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            setSubmitting(true);
            const { data } = await axios.delete(`${API_BASE_URL}/auth/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedList = data.addresses || addresses.filter(a => a._id !== addressId);
            setAddresses(updatedList);

            if (selectedAddressId === addressId) {
                const nextSelected = updatedList.find(a => a.isDefault) || updatedList[0] || null;
                if (nextSelected) {
                    setSelectedAddressId(nextSelected._id);
                    localStorage.setItem('shippingAddress', JSON.stringify(nextSelected));
                } else {
                    setSelectedAddressId(null);
                    localStorage.removeItem('shippingAddress');
                    setIsAddingNew(true);
                }
            }
        } catch (err) {
            console.error('Failed to delete address:', err);
            setError(err.response?.data?.message || 'Failed to delete address');
        } finally {
            setSubmitting(false);
        }
    };

    // Save or update address
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingAddressId) {
                // Update existing address
                const { data } = await axios.put(`${API_BASE_URL}/auth/addresses/${editingAddressId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const updatedList = data.addresses || [];
                setAddresses(updatedList);
                const edited = updatedList.find(a => a._id === editingAddressId) || formData;
                setSelectedAddressId(editingAddressId);
                localStorage.setItem('shippingAddress', JSON.stringify(edited));
                setIsAddingNew(false);
                setEditingAddressId(null);
            } else {
                // Add brand new address
                const { data } = await axios.post(`${API_BASE_URL}/auth/addresses`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const updatedList = data.addresses || [];
                setAddresses(updatedList);

                const newlyAdded = data.address || updatedList[updatedList.length - 1] || formData;
                setSelectedAddressId(newlyAdded._id);
                localStorage.setItem('shippingAddress', JSON.stringify(newlyAdded));

                // Direct to payment immediately with newly created address
                navigate('/checkout/payment');
                return;
            }
        } catch (err) {
            console.error('Failed to save address:', err);
            setError(err.response?.data?.message || 'Failed to save address');
            // If offline/error, still allow proceeding via localStorage
            if (!token) {
                localStorage.setItem('shippingAddress', JSON.stringify(formData));
                navigate('/checkout/payment');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf7] flex items-start justify-center px-4 pt-10 pb-20 font-sans">
            <SEO title="Delivery Address | Ownvibes" noindex={true} />
            <div className="max-w-2xl w-full">
                {/* Back button */}
                <button
                    onClick={() => navigate('/cart')}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-[#cf7e28] transition-colors mb-6 font-bold text-[14px]"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Cart
                </button>

                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1c] tracking-tight mb-2">
                            Delivery Address
                        </h1>
                        <p className="text-gray-500 text-[14px] font-medium">
                            Choose an existing address or add a new one for delivery.
                        </p>
                    </div>
                    {!isAddingNew && addresses.length > 0 && (
                        <button
                            type="button"
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-1.5 bg-[#cf7e28]/10 text-[#cf7e28] hover:bg-[#cf7e28] hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Add New Address
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                {loadingAddresses ? (
                    <div className="bg-white border border-[#f5eadb] rounded-[24px] p-12 text-center shadow-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#cf7e28] animate-spin mb-3" />
                        <p className="text-gray-600 font-bold text-sm">Loading your saved addresses...</p>
                    </div>
                ) : !isAddingNew && addresses.length > 0 ? (
                    /* Saved Addresses List */
                    <div className="space-y-4">
                        <div className="space-y-3">
                            {addresses.map((addr) => {
                                const isSelected = selectedAddressId === addr._id;
                                return (
                                    <div
                                        key={addr._id}
                                        onClick={() => handleSelectAddress(addr)}
                                        className={`group relative bg-white rounded-[20px] p-5 sm:p-6 border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                                            isSelected
                                                ? 'border-[#cf7e28] bg-gradient-to-br from-white to-[#fffaf4]'
                                                : 'border-[#f5eadb] hover:border-[#cf7e28]/40'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            {/* Radio circle and Name */}
                                            <div className="flex items-start gap-3.5">
                                                <div className="mt-1 flex items-center justify-center">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        isSelected ? 'border-[#cf7e28] bg-[#cf7e28]' : 'border-gray-300 group-hover:border-gray-400'
                                                    }`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[#1c1c1c] font-black text-lg">
                                                            {addr.name}
                                                        </span>
                                                        {addr.isDefault && (
                                                            <span className="bg-[#cf7e28]/15 text-[#cf7e28] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 space-y-1 text-[13px] text-gray-600 font-medium">
                                                        <p className="flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5 text-[#cf7e28] shrink-0" />
                                                            <span>{addr.phone}</span>
                                                        </p>
                                                        {addr.email && (
                                                            <p className="flex items-center gap-2">
                                                                <Mail className="w-3.5 h-3.5 text-[#cf7e28] shrink-0" />
                                                                <span>{addr.email}</span>
                                                            </p>
                                                        )}
                                                        <p className="flex items-start gap-2 pt-1 text-gray-700">
                                                            <MapPin className="w-3.5 h-3.5 text-[#cf7e28] shrink-0 mt-0.5" />
                                                            <span>
                                                                {addr.address}, {addr.city} - <strong className="text-black">{addr.postalCode}</strong>
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons (Edit & Delete) */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenEdit(addr, e)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-[#cf7e28] hover:bg-[#cf7e28]/10 transition-colors"
                                                    title="Edit address"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {addresses.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteAddress(addr._id, e)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Delete address"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Deliver to this address CTA */}
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={handleProceedToPayment}
                                className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#cf7e28]/25 text-base active:scale-[0.99]"
                            >
                                Deliver to this Address & Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Add / Edit Address Form */
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                        {addresses.length > 0 && (
                            <div className="flex justify-between items-center mb-1">
                                <h2 className="text-lg font-extrabold text-[#1c1c1c]">
                                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingNew(false);
                                        setEditingAddressId(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 font-bold text-sm px-2 py-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <div className="bg-white border border-[#f5eadb] rounded-[24px] p-6 sm:p-8 space-y-4 shadow-xl shadow-[#cf7e28]/5">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-extrabold text-black">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter recipient's full name"
                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Mobile / WhatsApp Number */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-extrabold text-black">Mobile / WhatsApp Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-extrabold text-black">Email Address (Optional)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com (for order updates & invoice)"
                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* City and Pincode */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-extrabold text-black">City / Town</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="City Name"
                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 px-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-extrabold text-black">Pincode</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength="6"
                                        placeholder="6-digit PIN"
                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 px-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                        value={formData.postalCode}
                                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Complete Address */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-extrabold text-black">Complete Street Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Flat/House No., Building Name, Street, Landmark..."
                                        className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all resize-none"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Set as Default Checkbox */}
                            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="w-4 h-4 text-[#cf7e28] rounded border-gray-300 focus:ring-[#cf7e28]"
                                />
                                <span className="text-[13px] font-bold text-gray-700">
                                    Set as default delivery address
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-md shadow-[#cf7e28]/25 text-base disabled:opacity-80"
                        >
                            {submitting ? (
                                <ButtonLoader text="Saving Address..." />
                            ) : (
                                <>
                                    {editingAddressId ? 'Save Changes' : 'Save & Continue to Payment'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddressPage;
