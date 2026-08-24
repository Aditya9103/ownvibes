import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import BlogManagement from './BlogManagement';
import OrderManagement from './OrderManagement';
import EnquiryManagement from './EnquiryManagement';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import OfferManagement from './OfferManagement';
import InstagramManagement from './InstagramManagement';
import ReviewManagement from './ReviewManagement';
import SEO from '../../components/SEO';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
    <div className="space-y-6">
      <SEO title="Admin Dashboard" />
                        <h1 className="text-3xl font-black text-white">Dashboard</h1>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Stats Cards */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="text-primary text-sm font-bold mb-2">Total Blogs</div>
                                <div className="text-4xl font-black text-white">0</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="text-primary text-sm font-bold mb-2">Published</div>
                                <div className="text-4xl font-black text-white">0</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="text-primary text-sm font-bold mb-2">Drafts</div>
                                <div className="text-4xl font-black text-white">0</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <p className="text-white">Welcome to the admin panel! Use the sidebar to manage products, blogs, and customer orders.</p>
                        </div>
                    </div>
                );

            case 'categories':
                return <CategoryManagement />;

            case 'products':
                return <ProductManagement />;

            case 'blogs':
                return <BlogManagement />;

            case 'orders':
                return <OrderManagement />;

            case 'offers':
                return <OfferManagement />;

            case 'instagram':
                return <InstagramManagement />;

            case 'enquiries':
                return <EnquiryManagement />;

            case 'reviews':
                return <ReviewManagement />;

            case 'users':
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-black text-white">User Details</h1>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <p className="text-white">User management coming soon...</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-dark flex">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
