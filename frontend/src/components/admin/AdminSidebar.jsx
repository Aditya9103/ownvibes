import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut, Menu, X, MessageSquare, Inbox, ShoppingBag, Grid2X2, Tag, Instagram, Star } from 'lucide-react';
import { logoutAdmin } from '../../utils/auth';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'categories', label: 'Categories', icon: Grid2X2 },
        { id: 'products', label: 'Products', icon: ShoppingBag },
        { id: 'orders', label: 'Orders', icon: MessageSquare }, // Using MessageSquare for now or import Package
        { id: 'offers', label: 'Offers', icon: Tag },
        { id: 'instagram', label: 'Instagram Reels', icon: Instagram },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'blogs', label: 'Blog Posts', icon: FileText },
        { id: 'enquiries', label: 'Enquiries', icon: Inbox },
        { id: 'users', label: 'User Details', icon: Users },
    ];

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark border border-primary/30 rounded-lg text-primary"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 bg-dark border-r border-white/10
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <h1 className="text-2xl font-black text-primary uppercase tracking-tighter">Dinus Ladoo</h1>
                        <p className="text-xs text-white mt-1 font-bold uppercase tracking-widest">Admin Panel</p>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-all duration-200
                                    ${activeTab === item.id
                                        ? 'bg-primary text-dark font-bold'
                                        : 'text-white hover:bg-white/5 hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}
        </>
    );
};

export default AdminSidebar;
