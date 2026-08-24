import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setLoading(true);
            const { data } = await axios.post(`${API_BASE_URL}/auth/register`, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

        return (
    <div className="min-h-[calc(100vh-80px)] flex items-start justify-center bg-[#fdfaf7] px-4 pt-10 pb-16 font-sans">
      <SEO title="Register" />
            <div className="w-full max-w-[480px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1c] tracking-tight mb-2">
                        Create Account
                    </h1>
                </div>

                <div className="bg-white border border-[#f5eadb] shadow-xl shadow-[#cf7e28]/5 rounded-[24px] p-8 md:p-10">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">
                                Mobile Number
                            </label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type="tel"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">
                                Secure Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-11 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-extrabold text-black">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-[#fdfaf7] border border-[#f5eadb] rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-bold text-black placeholder-gray-400 focus:bg-white focus:border-[#cf7e28] focus:ring-1 focus:ring-[#cf7e28] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-[#cf7e28] hover:bg-[#b56e22] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-8 shadow-md shadow-[#cf7e28]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-gray-500 text-[14px]">
                            Already have an account?{" "}
                            <Link to="/login" className="text-[#cf7e28] font-bold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Register;
