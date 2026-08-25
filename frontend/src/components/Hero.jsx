import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Heart, RefreshCcw, Lock, PlayCircle, ChevronRight, ChevronLeft } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full h-[260px] sm:h-[320px] md:h-[650px] lg:h-[700px] bg-white md:bg-[#fbf5f2] font-sans flex justify-center px-4 pt-4 md:p-0">
      
      {/* Mobile Card Wrapper */}
      <div className="relative w-full h-full rounded-[24px] md:rounded-none overflow-hidden bg-[#fbf5f2] shadow-sm md:shadow-none flex flex-row">

        {/* Removed white blur as requested previously to keep video visible */}

        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/combo_plushies.png"
          className="absolute inset-0 w-full h-full z-0 object-cover object-center"
        >
          <source src="/herovideo.mp4" type="video/mp4" />
        </video>

        {/* Main Content Container */}
        <div className="relative z-20 w-full max-w-[1400px] h-full flex flex-row items-center justify-between px-5 sm:px-6 md:px-8 lg:px-12 py-4 md:py-16">

        {/* Left Side: Text Content */}
        <div className="w-[65%] md:w-[50%] flex flex-col justify-center h-full -mt-6 md:-mt-24">

          <div className="flex items-center gap-1.5 mb-1.5 md:mb-6">
            <span className="text-[#dfa55c] text-[8px] sm:text-[9px] md:text-[11px] font-bold tracking-[0.2em] uppercase drop-shadow-md">
              Premium T-shirts
            </span>
            <Heart size={10} className="text-[#dfa55c] fill-current drop-shadow-md" />
          </div>

          <h1 className="text-[26px] sm:text-[34px] md:text-6xl lg:text-[75px] font-bold text-white leading-[1.1] mb-2 md:mb-6 tracking-tight font-serif w-[110%] md:w-full z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            Made for Comfort.<br />
            Made for <span className="text-[#dfa55c]">Style.</span>
          </h1>

          <p className="text-white text-[9px] sm:text-[11px] md:text-[16px] max-w-[95%] md:max-w-sm mb-4 md:mb-10 leading-relaxed font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Premium t-shirts crafted to bring comfort and style to every moment.
          </p>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-14">
            <Link
              to="/shop"
              className="bg-white hover:bg-[#dfa55c] text-[#1a1a1a] hover:text-white px-4 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold text-[10px] sm:text-[11px] md:text-[14px] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center gap-1 md:gap-2 hover:-translate-y-1"
            >
              Shop Collection <ChevronRight size={14} className="md:w-4 md:h-4 stroke-[3px]" />
            </Link>
            <button className="hidden md:flex bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 text-white px-6 py-3.5 rounded-full font-bold text-[14px] items-center gap-2 transition-all shadow-sm">
              Explore <PlayCircle size={18} className="text-[#dfa55c]" />
            </button>
          </div>

          {/* Features Row (Desktop Only) */}
          <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-4 pt-6 w-full max-w-2xl">

            <div className="flex items-start gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                <ShieldCheck size={16} className="text-[#dfa55c]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-white mb-0.5 drop-shadow-md">Premium Quality</span>
                <span className="text-[11px] font-bold text-gray-300 drop-shadow-md">Super Soft & Safe</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                <Heart size={16} className="text-[#dfa55c]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-white mb-0.5 drop-shadow-md">Kid Friendly</span>
                <span className="text-[11px] font-bold text-gray-300 drop-shadow-md">Non-Toxic Materials</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                <RefreshCcw size={16} className="text-[#dfa55c]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-white mb-0.5 drop-shadow-md">Easy Returns</span>
                <span className="text-[11px] font-bold text-gray-300 drop-shadow-md">7 Days Return Policy</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                <Lock size={16} className="text-[#dfa55c]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-white mb-0.5 drop-shadow-md">Secure Payment</span>
                <span className="text-[11px] font-bold text-gray-300 drop-shadow-md">100% Safe Checkout</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Offer Badge Only (Image is blended in background) */}
        <div className="hidden sm:flex w-[40%] md:w-[45%] h-full relative items-center justify-center">

          {/* Offer Badge (Hidden on mobile to match screenshot) */}
          <div className="hidden md:flex absolute top-[5%] md:top-[8%] right-0 md:right-[15%] z-30 bg-[#b58145] text-white w-28 h-28 md:w-[130px] md:h-[130px] rounded-full flex-col items-center justify-center shadow-2xl border-4 border-[#d8b888]/30 bg-gradient-to-br from-[#dfa55c] to-[#9d6d36]">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-0.5">Up To</span>
            <span className="text-3xl md:text-[42px] font-black leading-none mb-1">40%</span>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider">Off</span>
          </div>

        </div>

        {/* Mobile Carousel Dots */}
        <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-md"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#dfa55c] shadow-md"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300/50 shadow-md"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300/50 shadow-md"></div>
        </div>

      </div>
      </div>

      {/* Slider Controls */}
      <button className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 border border-white/20 rounded-full items-center justify-center text-white backdrop-blur-sm transition-all shadow-sm">
        <ChevronLeft size={20} />
      </button>
      <button className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 border border-white/20 rounded-full items-center justify-center text-white backdrop-blur-sm transition-all shadow-sm">
        <ChevronRight size={20} />
      </button>

    </section>
  );
};

export default Hero;
