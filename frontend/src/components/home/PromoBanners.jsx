import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Leaf, Wind, Shirt, Diamond, ArrowRight, Award, Truck, Package, Lock } from 'lucide-react';

const PromoBanners = () => {
    return (
        <section className="bg-[#fdfdfc] font-sans py-16 md:py-24">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* Main Hero Container */}
                <div className="relative w-full rounded-[32px] overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[400px] lg:min-h-[460px] bg-[#f8f5f0]">
                    
                    {/* Angled Background Split (Desktop) */}
                    <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[55%] bg-[#dfd3c3]" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                    {/* Background Split (Mobile) */}
                    <div className="block lg:hidden absolute inset-0 bg-gradient-to-b from-[#f8f5f0] via-[#f8f5f0] to-[#dfd3c3]"></div>

                    {/* Background pattern vector (optional subtle wave/lines) */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1c1c1c 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                    {/* Left Content */}
                    <div className="relative z-10 w-full lg:w-[55%] p-6 md:p-10 lg:p-12 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                        
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm w-max mb-6">
                            <Star size={12} className="text-[#b58145] fill-[#b58145]" />
                            <span className="text-[10px] font-bold tracking-[0.15em] text-[#b58145]">EXCLUSIVE OFFERS</span>
                        </div>

                        {/* Title */}
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-[54px] font-black text-[#1c1c1c] leading-[1.05] mb-4 tracking-tight">
                            The Perfect<br />
                            <span className="text-[#b58145]">T-Shirt Combos</span>
                        </h2>

                        {/* Subtitle */}
                        <p className="text-[#4a4036] font-medium text-[14px] md:text-[15px] leading-relaxed mb-8 max-w-md">
                            Curated for every vibe and every occasion.<br />
                            Premium quality. Timeless comfort.<br />
                            Made for you.
                        </p>

                        {/* Feature Icons Row */}
                        <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 mb-8 w-full md:w-auto">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fcfaf7] border border-[#e8dfd3] shadow-sm flex items-center justify-center text-[#b58145]">
                                    <Leaf size={18} strokeWidth={1.5} />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-[#1c1c1c] text-center leading-tight">100%<br />Premium Cotton</span>
                            </div>
                            {/* Feature 2 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fcfaf7] border border-[#e8dfd3] shadow-sm flex items-center justify-center text-[#b58145]">
                                    <Wind size={18} strokeWidth={1.5} />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-[#1c1c1c] text-center leading-tight">Breathable<br />All Day</span>
                            </div>
                            {/* Feature 3 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fcfaf7] border border-[#e8dfd3] shadow-sm flex items-center justify-center text-[#b58145]">
                                    <Shirt size={18} strokeWidth={1.5} />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-[#1c1c1c] text-center leading-tight">Modern Fit<br />For Everyone</span>
                            </div>
                            {/* Feature 4 */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fcfaf7] border border-[#e8dfd3] shadow-sm flex items-center justify-center text-[#b58145]">
                                    <Diamond size={18} strokeWidth={1.5} />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-bold text-[#1c1c1c] text-center leading-tight">Premium<br />Quality</span>
                            </div>
                        </div>

                        {/* Button */}
                        <Link to="/shop" className="inline-flex items-center justify-center gap-3 bg-[#111111] hover:bg-black text-[#e8dfd3] px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 shadow-xl shadow-black/20 w-max group border border-gray-800">
                            Explore Combos <ArrowRight size={16} className="text-[#b58145] group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Center Floating Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center justify-center w-32 h-32 bg-[#fcfaf7] rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-4 border-white">
                        <span className="text-[11px] font-bold text-[#1c1c1c] tracking-widest mb-1">UP TO</span>
                        <span className="text-4xl font-black text-[#b58145] leading-none mb-1">50%</span>
                        <span className="text-[11px] font-bold text-[#1c1c1c] tracking-widest">OFF</span>
                    </div>

                    {/* Right Image */}
                    <div className="relative z-10 w-full lg:w-[45%] h-[300px] lg:h-auto lg:absolute lg:right-0 lg:top-0 lg:bottom-0 flex items-center justify-center lg:justify-end overflow-hidden rounded-r-[32px]">
                        <img 
                            src="/tishirtcombo.png" 
                            alt="Premium T-Shirt Combos" 
                            className="w-full h-full object-cover object-center lg:object-right mix-blend-multiply drop-shadow-2xl scale-110 lg:scale-100"
                        />
                    </div>
                </div>

                {/* Bottom Feature Pill Row */}
                <div className="mt-8 relative z-20">
                    <div className="bg-[#fcfaf7] rounded-2xl md:rounded-full py-6 md:py-8 px-6 md:px-12 shadow-sm border border-[#f0ede6]">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y-0 lg:divide-x divide-[#e8e4db]">
                            
                            {/* Feature 1 */}
                            <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-3 lg:gap-4 lg:pl-0 lg:justify-center text-center md:text-left">
                                <Award size={28} strokeWidth={1.5} className="text-[#b58145]" />
                                <div>
                                    <h4 className="font-bold text-[13px] text-[#1c1c1c]">Premium Quality</h4>
                                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">Crafted to Perfection</p>
                                </div>
                            </div>
                            
                            {/* Feature 2 */}
                            <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-3 lg:gap-4 lg:pl-4 lg:justify-center text-center md:text-left">
                                <Truck size={28} strokeWidth={1.5} className="text-[#b58145]" />
                                <div>
                                    <h4 className="font-bold text-[13px] text-[#1c1c1c]">Free Delivery</h4>
                                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">On Orders Above ₹999</p>
                                </div>
                            </div>
                            
                            {/* Feature 3 */}
                            <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-3 lg:gap-4 lg:pl-4 lg:justify-center text-center md:text-left">
                                <Package size={28} strokeWidth={1.5} className="text-[#b58145]" />
                                <div>
                                    <h4 className="font-bold text-[13px] text-[#1c1c1c]">Easy Returns</h4>
                                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">7 Days Return Policy</p>
                                </div>
                            </div>
                            
                            {/* Feature 4 */}
                            <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-3 lg:gap-4 lg:pl-4 lg:justify-center text-center md:text-left">
                                <Lock size={28} strokeWidth={1.5} className="text-[#b58145]" />
                                <div>
                                    <h4 className="font-bold text-[13px] text-[#1c1c1c]">Secure Payments</h4>
                                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">100% Safe & Secure</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PromoBanners;
