import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Heart, RefreshCcw, Lock, PlayCircle, ChevronRight, ChevronLeft } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full h-[260px] sm:h-[320px] md:h-[650px] lg:h-[700px] bg-white md:bg-[#fbf5f2] font-sans flex justify-center px-4 pt-4 md:p-0">

      {/* Mobile Card Wrapper */}
      <div className="relative w-full h-full rounded-[24px] md:rounded-none overflow-hidden bg-[#fbf5f2] shadow-sm md:shadow-none flex flex-row">

        {/* Stronger Background Gradient for Left Side for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf5f2]/95 to-transparent z-10 pointer-events-none w-full md:w-[35%]" />

        {/* Background Video */}
        <video
          autoPlay
          loop
          muted={true}
          playsInline={true}
          className="absolute inset-0 w-full h-full z-0 object-cover object-center"
        >
          <source src="https://pdf-storage-prime.s3.eu-north-1.amazonaws.com/ecommerce/247fc982913ecd7d80546bc13384ee14-WhatsApp Video 2026-08-22 at 16.57.58.mp4" type="video/mp4" />
        </video>

        {/* Main Content Container */}
        <div className="relative z-20 w-full max-w-[1400px] h-full flex flex-row items-center justify-between px-5 sm:px-6 md:px-8 lg:px-12 py-4 md:py-16">

          {/* Left Side: Text Content */}
          <div className="w-[65%] md:w-[50%] flex flex-col justify-center h-full -mt-6 md:-mt-24">

            <div className="flex items-center gap-1.5 mb-1.5 md:mb-6">
              <span className="text-[#a57a4a] text-[8px] sm:text-[9px] md:text-[11px] font-bold tracking-[0.2em] uppercase">
                Premium T-shirts
              </span>
              <Heart size={10} className="text-[#a57a4a] fill-current" />
            </div>

            <h1 className="text-[26px] sm:text-[34px] md:text-6xl lg:text-[75px] font-bold text-[#1a1a1a] leading-[1.1] mb-2 md:mb-6 tracking-tight font-serif w-[110%] md:w-full z-10 drop-shadow-sm">
              Made for Comfort.<br />
              Made for <span className="text-[#b58145]">Style.</span>
            </h1>

            <p className="text-[#3d322b] text-[9px] sm:text-[11px] md:text-[16px] max-w-[95%] md:max-w-sm mb-4 md:mb-10 leading-relaxed font-medium drop-shadow-sm z-10">
              Premium t-shirts crafted to bring comfort and style to every moment.
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-14">
              <Link
                to="/shop"
                className="bg-[#b58145] hover:bg-[#9d6d36] text-white px-5 py-3 md:px-8 md:py-4 rounded-full font-black text-[12px] md:text-[14px] transition-all duration-300 shadow-xl shadow-amber-900/20 flex items-center gap-2 hover:shadow-amber-900/40 hover:-translate-y-0.5"
              >
                Shop Collection <ChevronRight size={16} />
              </Link>
            </div>

            {/* Features Row (Desktop Only) */}
            <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-4 pt-6 w-full max-w-2xl">

              <div className="flex items-start gap-2.5 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/50">
                <div className="w-6 h-6 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={12} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-[#1c1c1c] mb-0.5 tracking-wide">Premium Quality</span>
                  <span className="text-[10px] font-bold text-[#483d36]">Super Soft & Safe</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/50">
                <div className="w-6 h-6 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <Heart size={12} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-[#1c1c1c] mb-0.5 tracking-wide">Kid Friendly</span>
                  <span className="text-[10px] font-bold text-[#483d36]">Non-Toxic Materials</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/50">
                <div className="w-6 h-6 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCcw size={12} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-[#1c1c1c] mb-0.5 tracking-wide">Easy Returns</span>
                  <span className="text-[10px] font-bold text-[#483d36]">7 Days Return Policy</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/50">
                <div className="w-6 h-6 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={12} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-[#1c1c1c] mb-0.5 tracking-wide">Secure Payment</span>
                  <span className="text-[10px] font-bold text-[#483d36]">100% Safe Checkout</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Offer Badge Only (Image is blended in background) */}
          <div className="hidden sm:flex w-[40%] md:w-[45%] h-full relative items-center justify-center">

            {/* Offer Badge (Hidden on mobile to match screenshot) */}
            <div className="hidden md:flex absolute top-[5%] md:top-[8%] right-0 md:right-[15%] z-30 bg-[#b58145] text-white w-28 h-28 md:w-[130px] md:h-[130px] rounded-full flex-col items-center justify-center shadow-2xl border-4 border-[#d8b888]/30 bg-gradient-to-br from-[#c69355] to-[#9d6d36]">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-0.5">Up To</span>
              <span className="text-3xl md:text-[42px] font-black leading-none mb-1">40%</span>
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider">Off</span>
            </div>

          </div>

          {/* Mobile Carousel Dots */}
          <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#b58145]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>

        </div>
      </div>

      {/* Slider Controls */}
      <button className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/50 hover:bg-white rounded-full items-center justify-center text-gray-800 backdrop-blur-sm transition-all shadow-sm">
        <ChevronLeft size={20} />
      </button>
      <button className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/50 hover:bg-white rounded-full items-center justify-center text-gray-800 backdrop-blur-sm transition-all shadow-sm">
        <ChevronRight size={20} />
      </button>

    </section>
  );
};

export default Hero;
