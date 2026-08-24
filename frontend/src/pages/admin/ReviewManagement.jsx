import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import { Check, X, Trash2, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_BASE_URL}/reviews/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            alert('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(
                `${API_BASE_URL}/reviews/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchReviews();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update review status');
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_BASE_URL}/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    if (loading) return <div className="p-8">Loading reviews...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fdfaf7]">
                <h2 className="text-xl font-bold text-[#1c1c1c]">Manage Reviews</h2>
                <div className="text-sm text-gray-500 font-medium">
                    Total: {reviews.length} | Pending: {reviews.filter(r => r.status === 'pending').length}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating & Comment</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reviews.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No reviews found.
                                </td>
                            </tr>
                        ) : (
                            reviews.map((review) => (
                                <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {review.product ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img src={review.product.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="font-medium text-sm text-gray-900 line-clamp-2 max-w-[150px]">
                                                    {review.product.name}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-red-500 text-sm">Product Deleted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{review.user?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{review.user?.email}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="flex items-center gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < review.rating ? 'text-[#cf7e28] fill-[#cf7e28]' : 'text-gray-300'} />
                                            ))}
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">{review.title}</div>
                                        <div className="text-sm text-gray-600 line-clamp-2 mt-1">{review.comment}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full ${
                                            review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {review.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {review.status !== 'approved' && (
                                                <button
                                                    onClick={() => updateStatus(review._id, 'approved')}
                                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <button
                                                    onClick={() => updateStatus(review._id, 'rejected')}
                                                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteReview(review._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-2"
                                                title="Delete completely"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReviewManagement;
