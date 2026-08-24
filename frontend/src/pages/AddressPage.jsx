import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { MapPin, Phone, User, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const AddressPage = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const [formData, setFormData] = useState(() => {
        const savedAddress = localStorage.getItem('shippingAddress');
        return savedAddress ? JSON.parse(savedAddress) : {
            name: '',
            email: '',
            phone: '',
            city: '',
            postalCode: '',
            address: ''
        };
    });

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login?redirect=/checkout/address');
            return;
        }

        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('shippingAddress', JSON.stringify(formData));
        navigate('/checkout/payment');
    };

    return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf7] flex items-start justify-center px-4 pt-10 pb-16 font-sans">
      <SEO title="Address" noindex={true} />
            <div className="max-w-xl w-full">
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#cf7e28] transition-colors mb-6 font-bold text-[14px]"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Cart
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1c] tracking-tight mb-2">
                        Shipping Details
                    </h1>
                    <p className="text-gray-500 text-[14px] font-medium">
                        Where should we deliver your order?
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white border border-[#f5eadb] rounded-[24px] p-8 space-y-5 shadow-xl shadow-[#cf7e28]/5">
                        
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">WhatsApp Number</label>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-extrabold text-black">City</label>
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
                                    placeholder="XXXXXX"
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 px-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                    value={formData.postalCode}
                                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">Complete Address</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="House No, Street, Landmark..."
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all resize-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-md shadow-[#cf7e28]/20"
                    >
                        Continue to Payment
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddressPage;
