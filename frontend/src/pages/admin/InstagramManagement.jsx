import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Instagram } from 'lucide-react';
import SEO from '../../components/SEO';

const InstagramManagement = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        link: '',
        image: '',
        title: ''
    });

    const fetchReels = async () => {
        try {
            const { data } = await axios.get('/api/instagram');
            setReels(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load Instagram reels');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const fd = new FormData();
        fd.append('image', file);
        setUploadingImage(true);

        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/upload', fd, config);
            setFormData(prev => ({ ...prev, image: data.url }));
        } catch (error) {
            console.error(error);
            alert('Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('/api/instagram', formData, config);
            setFormData({ link: '', image: '', title: '' });
            fetchReels();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add reel');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this reel?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/api/instagram/${id}`, config);
                fetchReels();
            } catch (err) {
                alert('Failed to delete reel');
            }
        }
    };

    if (loading) return <div className="text-white p-8">Loading...</div>;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    return (
        <div className="space-y-6">
            <SEO title="Instagram Management" />
            <div className="flex items-center gap-3 mb-6">
                <Instagram size={32} className="text-pink-500" />
                <h1 className="text-3xl font-black text-white">Instagram Reels</h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Add New Reel</h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-white mb-1">Instagram Post Link</label>
                        <input
                            type="url"
                            name="link"
                            value={formData.link}
                            onChange={handleChange}
                            required
                            placeholder="e.g. https://instagram.com/p/XXXXX/"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-white mb-1">Thumbnail Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={uploadFileHandler}
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-pink-500 file:text-white hover:file:bg-pink-600 transition-colors cursor-pointer"
                        />
                        {uploadingImage && <div className="text-pink-500 mt-2 text-sm font-bold">Uploading...</div>}
                        {formData.image && !uploadingImage && (
                            <div className="mt-4">
                                <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-white/20" />
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-white mb-1">Caption / Title</label>
                        <textarea
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            rows="2"
                            placeholder="e.g. Cutest BFF\nForever 💞"
                            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2 transition-colors">
                            <Plus size={20} /> Add Reel
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
                {reels.map((reel) => (
                    <div key={reel._id} className="relative group bg-white/5 border border-white/10 rounded-xl overflow-hidden aspect-[9/16]">
                        <img 
                            src={reel.image} 
                            alt={reel.title} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
                            <p className="text-white text-xs font-bold leading-tight whitespace-pre-line truncate">{reel.title}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(reel._id)}
                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg z-20 backdrop-blur-sm transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            
            {reels.length === 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                    <p className="text-gray-400">No Instagram reels added yet.</p>
                </div>
            )}
        </div>
    );
};

export default InstagramManagement;
