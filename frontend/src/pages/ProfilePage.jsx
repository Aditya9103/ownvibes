import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, LogOut, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import SEO from '../components/SEO';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [userInfo, setUserInfo] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUserInfo(JSON.parse(storedUser));

        const storedAddress = localStorage.getItem('shippingAddress');
        if (storedAddress) {
            setShippingAddress(JSON.parse(storedAddress));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
        clearCart();
        navigate('/');
    };

    if (!userInfo) return null;

    return (
    <div className="min-h-screen bg-[#fdfaf7] pt-8 pb-20">
      <SEO title="Profile" noindex={true} />
            <div className="container-custom max-w-4xl px-4">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#2a2a2a] mb-2 font-serif">
                        My <span className="text-[#b58145]">Profile</span>
                    </h1>
                    <p className="text-[#786b62]">Manage your account details and preferences.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-[#e8dfd8] shadow-sm text-center relative overflow-hidden">
                            <div className="w-24 h-24 bg-[#fcf9f5] rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-md mb-6 relative z-10">
                                <User className="w-10 h-10 text-[#b58145]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#2a2a2a] mb-1 relative z-10">{userInfo.name}</h2>
                            <p className="text-[#786b62] text-sm flex items-center justify-center gap-2 relative z-10">
                                <Mail className="w-4 h-4" /> {userInfo.email}
                            </p>
                            
                            {/* Decorative background element */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#b58145]/5 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#b58145]/5 rounded-full blur-2xl"></div>
                        </div>

                        <div className="bg-white rounded-3xl p-4 border border-[#e8dfd8] shadow-sm">
                            <button
                                onClick={() => navigate('/my-orders')}
                                className="w-full flex items-center gap-3 p-4 hover:bg-[#fcf9f5] rounded-2xl transition-colors text-left"
                            >
                                <div className="bg-[#b58145]/10 p-3 rounded-xl text-[#b58145]">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2a2a2a]">My Orders</h3>
                                    <p className="text-xs text-[#786b62]">View and track your orders</p>
                                </div>
                            </button>
                            
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-2xl transition-colors text-left mt-2 group"
                            >
                                <div className="bg-red-100 p-3 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-500">Logout</h3>
                                    <p className="text-xs text-red-400">Sign out of your account</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-[#e8dfd8] shadow-sm">
                            <h3 className="text-xl font-bold text-[#2a2a2a] mb-6 flex items-center gap-2 border-b border-[#e8dfd8] pb-4">
                                <User className="w-5 h-5 text-[#b58145]" />
                                Personal Information
                            </h3>
                            
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-bold text-[#786b62] uppercase tracking-wider mb-1">Full Name</p>
                                    <p className="text-[#2a2a2a] font-medium bg-[#fcf9f5] px-4 py-3 rounded-xl border border-[#e8dfd8]">{userInfo.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#786b62] uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-[#2a2a2a] font-medium bg-[#fcf9f5] px-4 py-3 rounded-xl border border-[#e8dfd8]">{userInfo.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-[#e8dfd8] shadow-sm">
                            <h3 className="text-xl font-bold text-[#2a2a2a] mb-6 flex items-center gap-2 border-b border-[#e8dfd8] pb-4">
                                <MapPin className="w-5 h-5 text-[#b58145]" />
                                Saved Delivery Address
                            </h3>
                            
                            {shippingAddress ? (
                                <div className="bg-[#fcf9f5] p-6 rounded-2xl border border-[#e8dfd8]">
                                    <p className="text-[#2a2a2a] font-bold mb-2 text-lg">{shippingAddress.fullName}</p>
                                    <p className="text-[#786b62] mb-1">{shippingAddress.phone}</p>
                                    <p className="text-[#786b62] leading-relaxed">
                                        {shippingAddress.address}<br />
                                        {shippingAddress.city}, {shippingAddress.state}<br />
                                        {shippingAddress.pincode}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MapPin className="w-12 h-12 text-[#e8dfd8] mx-auto mb-3" />
                                    <p className="text-[#786b62] font-medium">No address saved yet.</p>
                                    <p className="text-sm text-[#9e8f85]">It will be saved automatically when you place an order.</p>
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
