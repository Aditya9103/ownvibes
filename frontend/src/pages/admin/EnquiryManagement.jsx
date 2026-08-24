import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api';
import { Eye, X, Trash2, Phone, Mail, MapPin, GraduationCap, Building2 } from 'lucide-react';
import SEO from '../../components/SEO';

const EnquiryManagement = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            const response = await axios.get(`${API_BASE_URL}/enquiry/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnquiries(response.data.data);
        } catch (error) {
            console.error('Error fetching enquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewDetails = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowDetailModal(true);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.put(
                `${API_BASE_URL}/enquiry/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchEnquiries();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
            await axios.delete(`${API_BASE_URL}/enquiry/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEnquiries();
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error deleting enquiry:', error);
            alert('Failed to delete enquiry');
        }
    };

    if (loading) {
        return (
    <div className="flex items-center justify-center h-64">
      <SEO title="Enquiry Management" />
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Enquiries</h1>
                <div className="text-white">
                    Total: <span className="text-primary font-bold">{enquiries.length}</span>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {enquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-white">
                                        No enquiries yet
                                    </td>
                                </tr>
                            ) : (
                                enquiries.map((enquiry) => (
                                    <tr key={enquiry._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{enquiry.studentName}</td>
                                        <td className="px-6 py-4 text-white">{enquiry.mobile}</td>
                                        <td className="px-6 py-4 text-white text-sm">{enquiry.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {enquiry.course.map((c, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={enquiry.status}
                                                onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${enquiry.status === 'interested'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}
                                            >
                                                <option value="interested">Interested</option>
                                                <option value="not_interested">Not Interested</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-white text-sm">
                                            {new Date(enquiry.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => viewDetails(enquiry)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-dark rounded-lg transition-all font-bold text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(enquiry._id)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all font-bold text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Detail Modal */}
            {showDetailModal && selectedEnquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
                    <div
                        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"
                        onClick={() => setShowDetailModal(false)}
                    />
                    <div className="bg-dark border border-white/20 relative w-full max-w-4xl p-0 rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col">
                        {/* Modal Header - Fixed */}
                        <div className="p-8 pb-0 flex justify-between items-center shrink-0">
                            <h2 className="text-3xl font-black text-white">Enquiry Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 text-white hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Personal Information */}
                                <div className="space-y-6">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                        <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Visitor Information</h3>

                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">Visitor Name</label>
                                            <p className="text-white font-bold text-lg">{selectedEnquiry.visitorName}</p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-primary mt-1" />
                                            <div className="flex-1">
                                                <label className="text-white text-xs font-bold uppercase">Visitor Mobile</label>
                                                <p className="text-white font-bold">{selectedEnquiry.mobileNumber}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">Date</label>
                                            <p className="text-white font-bold">{new Date(selectedEnquiry.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                        <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Student Information</h3>

                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">Student Name</label>
                                            <p className="text-white font-bold text-lg">{selectedEnquiry.studentName}</p>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Phone className="w-5 h-5 text-primary mt-1" />
                                            <div className="flex-1">
                                                <label className="text-white text-xs font-bold uppercase">Student Mobile</label>
                                                <p className="text-white font-bold">{selectedEnquiry.mobile}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Mail className="w-5 h-5 text-primary mt-1" />
                                            <div className="flex-1">
                                                <label className="text-white text-xs font-bold uppercase">Email</label>
                                                <p className="text-white font-bold break-all">{selectedEnquiry.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-primary mt-1" />
                                            <div className="flex-1">
                                                <label className="text-white text-xs font-bold uppercase">Address</label>
                                                <p className="text-white">{selectedEnquiry.address}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Building2 className="w-5 h-5 text-primary mt-1" />
                                            <div className="flex-1">
                                                <label className="text-white text-xs font-bold uppercase">City</label>
                                                <p className="text-white font-bold">{selectedEnquiry.city}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">Reference Name</label>
                                            <p className="text-white font-bold">{selectedEnquiry.referenceName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Course & Preferences */}
                                <div className="space-y-6">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                        <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Course & Preferences</h3>

                                        <div className="flex items-start gap-3">
                                            <GraduationCap className="w-5 h-5 text-primary mt-1" />
                                            <div className="flex-1">
                                                <label className="text-white text-xs font-bold uppercase">Interested Courses</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {selectedEnquiry.course.map((c, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-primary/20 text-primary text-sm font-bold rounded-full">
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedEnquiry.score && (
                                            <div>
                                                <label className="text-white text-xs font-bold uppercase">Score</label>
                                                <p className="text-white font-bold text-xl">{selectedEnquiry.score}</p>
                                            </div>
                                        )}

                                        {selectedEnquiry.statePreference && selectedEnquiry.statePreference.length > 0 && (
                                            <div>
                                                <label className="text-white text-xs font-bold uppercase">State Preferences</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {selectedEnquiry.statePreference.map((state, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full">
                                                            {state}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-white text-xs font-bold uppercase">Status</label>
                                            <select
                                                value={selectedEnquiry.status}
                                                onChange={(e) => {
                                                    handleStatusChange(selectedEnquiry._id, e.target.value);
                                                    setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value });
                                                }}
                                                className={`w-full mt-2 px-4 py-2 rounded-lg font-bold cursor-pointer ${selectedEnquiry.status === 'interested'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}
                                            >
                                                <option value="interested">Interested</option>
                                                <option value="not_interested">Not Interested</option>
                                            </select>
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <label className="text-white text-xs font-bold uppercase">Submitted On</label>
                                            <p className="text-white font-bold">
                                                {new Date(selectedEnquiry.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => handleDelete(selectedEnquiry._id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Delete Enquiry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnquiryManagement;
