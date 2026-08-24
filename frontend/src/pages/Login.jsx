import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mail, Loader2, LogIn } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const redirect = new URLSearchParams(location.search).get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);
            const { data } = await axios.post(`${API_BASE_URL}/auth/passwordless-login`, { identifier });

            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate(redirect);
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid email or phone number');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-start justify-center bg-[#fdfaf7] px-4 pt-10 pb-16 font-sans">
            <SEO title="Login" />
            <div className="w-full max-w-[420px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1c] tracking-tight mb-2">
                        Welcome Back
                    </h1>
                </div>

                <div className="bg-white border border-[#f5eadb] shadow-xl shadow-[#cf7e28]/5 rounded-[24px] p-8 md:p-10">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Identifier */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-extrabold text-black">
                                Email Address or Mobile Number
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#cf7e28] transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter Email or Phone"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Log In <LogIn className="w-5 h-5" /></>}
                        </button>
                    </form>

                    {/* Register */}
                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-gray-500 text-[14px]">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-[#cf7e28] font-bold hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
