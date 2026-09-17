import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, Menu, X, ChevronRight, Package, ChevronLeft, Share2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const ROUTE_TITLES = {
    '/shop': 'Explore Collection',
    '/cart': 'Shopping Bag',
    '/wishlist': 'Saved Items',
    '/profile': 'My Account',
    '/my-orders': 'My Orders',
    '/checkout/address': 'Delivery Address',
    '/checkout/payment': 'Payment',
    '/checkout/success': 'Order Confirmed',
    '/new-arrivals': 'New Arrivals',
    '/best-sellers': 'Best Sellers',
    '/offers': 'Exclusive Offers',
    '/about': 'About Ownvibes',
    '/contact': 'Contact Us',
    '/faqs': 'FAQs & Help',
    '/shipping-policy': 'Shipping Policy',
    '/return-policy': 'Return Policy',
    '/terms': 'Terms & Conditions',
    '/privacy': 'Privacy Policy',
    '/help': 'Help Center',
    '/blog': 'Style Journal',
    '/login': 'Sign In',
    '/register': 'Create Account',
    '/forgot-password': 'Reset Password',
};

const ROOT_PATHS = ['/', '/shop', '/wishlist', '/cart', '/profile'];

const Navbar = () => {
    const { cartItems } = useCart();
    const { wishlistItems } = useWishlist();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (location.pathname === '/' && window.scrollY > 40) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setIsMobileMenuOpen(false);
            setIsSearchExpanded(false);
        }
    };

    const handleBack = () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(8);
        }
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: window.location.href,
                });
            } catch (err) {
                // User dismissed share dialog
            }
        }
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
        { name: 'New Arrivals', href: '/new-arrivals' },
        { name: 'Best Sellers', href: '/best-sellers' },
        { name: 'Offers', href: '/offers' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
    ];

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isHomePage = location.pathname === '/';
    const isTransparent = isHomePage && !isScrolled && isDesktop;
    const wrapperPosition = (isHomePage && isDesktop) ? 'fixed' : 'sticky';

    const isPDP = location.pathname.startsWith('/product/');
    const isSubpage = !ROOT_PATHS.includes(location.pathname);
    const displayTitle = isPDP ? 'Product Details' : (ROUTE_TITLES[location.pathname] || 'Ownvibes');

    return (
        <div
            className={`${wrapperPosition} top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'pointer-events-none' : ''}`}
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
        >
            {/* Announcement Bar (Top) - Collapses smoothly on scroll */}
            {isHomePage && (
                <div className={`w-full bg-[#1c1c1c] text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all duration-300 overflow-hidden pointer-events-auto ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100 py-1.5 sm:py-2'}`}>
                    <span className="flex items-center gap-1 sm:gap-2 px-2 text-center leading-tight">
                        <span className="hidden sm:inline">🎉 SPECIAL OFFER: Get 10% off your first order!</span>
                        <span className="sm:hidden">🎉 10% OFF first order!</span>
                        Use code <span className="text-[#c1865a] font-bold">VIBES10</span>
                    </span>
                </div>
            )}

            <header className={`font-sans mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto ${isScrolled
                ? 'w-full md:w-[98%] max-w-[1800px] mt-0 md:mt-2 bg-white/95 md:bg-white/90 backdrop-blur-md md:backdrop-blur-xl shadow-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-none md:rounded-full border-b border-gray-200 md:border md:border-gray-200/50'
                : isTransparent
                    ? 'w-full bg-transparent border-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                    : 'w-full bg-white/95 backdrop-blur-md border-b border-gray-100'
                }`}>
                <div className={`max-w-[1400px] mx-auto transition-all duration-300 ${isScrolled ? 'px-3 min-[375px]:px-4 sm:px-6 py-2 sm:py-2.5' : 'px-3 min-[375px]:px-4 md:px-8 py-2.5 md:py-4'}`}>

                    {/* ============================================================ */}
                    {/* MOBILE TOP BAR (md:hidden) — Adaptive Native Experience      */}
                    {/* ============================================================ */}
                    <div className="flex md:hidden items-center justify-between gap-2 h-11 min-[375px]:h-12">
                        {isSubpage ? (
                            /* Subpage: Native Back Button */
                            <button
                                onClick={handleBack}
                                aria-label="Go back"
                                className="p-2 -ml-2 text-gray-800 hover:text-[#b58145] active:scale-90 transition-transform flex items-center justify-center rounded-full"
                            >
                                <ChevronLeft size={24} strokeWidth={2.4} />
                            </button>
                        ) : (
                            /* Root Tab: Brand Hamburger Menu Toggle */
                            <button
                                className={`p-1.5 -ml-1 flex-shrink-0 ${isTransparent ? 'text-white' : 'text-[#1c1c1c]'} hover:text-[#c1865a] transition-colors rounded-lg`}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Open navigation menu"
                            >
                                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        )}

                        {/* Center: Title on Subpages OR Brand Logo on Root Pages */}
                        {isSubpage ? (
                            <div className="flex-1 text-center truncate px-2">
                                <h1 className="text-[15px] font-bold tracking-tight text-gray-900 truncate">
                                    {displayTitle}
                                </h1>
                            </div>
                        ) : (
                            <Link to="/" className="flex items-center flex-shrink-0 relative h-10 z-20">
                                <img
                                    src="/logo.jpeg"
                                    alt="Ownvibes Logo"
                                    className={`w-auto object-cover rounded-full shadow-sm transition-all duration-300 ${isScrolled ? 'h-9 min-[375px]:h-10' : 'h-10 min-[375px]:h-11'}`}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </Link>
                        )}

                        {/* Right Actions */}
                        <div className="flex items-center gap-1.5 min-[375px]:gap-2 text-[#1c1c1c] flex-shrink-0">
                            {isSubpage ? (
                                <>
                                    {/* PDP Native Share */}
                                    {isPDP && typeof navigator !== 'undefined' && 'share' in navigator && (
                                        <button
                                            onClick={handleShare}
                                            aria-label="Share product"
                                            className="p-1.5 text-gray-700 hover:text-[#b58145] active:scale-90 transition-all rounded-full"
                                        >
                                            <Share2 size={20} strokeWidth={1.8} />
                                        </button>
                                    )}

                                    {/* Cart Button */}
                                    <Link to="/cart" aria-label="Shopping Cart" className="relative p-1.5 text-gray-800 hover:text-[#b58145] transition-colors">
                                        <ShoppingCart size={21} strokeWidth={1.8} />
                                        {cartItems.length > 0 && (
                                            <span className="absolute 0 top-0 right-0 bg-[#b58145] text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white shadow-sm">
                                                {cartItems.length > 99 ? '99+' : cartItems.length}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Menu toggle so category drawer is always reachable */}
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        aria-label="Toggle navigation drawer"
                                        className="p-1.5 text-gray-800 hover:text-[#b58145] transition-colors rounded-lg"
                                    >
                                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Search Trigger */}
                                    <button
                                        className={`p-1.5 ${isTransparent ? 'text-white' : 'text-[#1c1c1c]'} hover:text-[#c1865a] transition-colors`}
                                        onClick={() => setIsMobileMenuOpen(true)}
                                        aria-label="Search"
                                    >
                                        <Search size={21} strokeWidth={1.8} />
                                    </button>

                                    {/* Wishlist */}
                                    <Link to="/wishlist" aria-label="Wishlist" className="relative p-1.5 hover:text-[#c1865a] transition-colors">
                                        <Heart size={21} strokeWidth={1.8} className={isTransparent ? 'text-white' : 'text-[#1c1c1c]'} />
                                        {wishlistItems.length > 0 && (
                                            <span className="absolute top-0 right-0 bg-[#ef4c7f] text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white shadow-sm">
                                                {wishlistItems.length}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Cart */}
                                    <Link to="/cart" aria-label="Shopping Cart" className="relative p-1.5 hover:text-[#c1865a] transition-colors">
                                        <ShoppingCart size={21} strokeWidth={1.8} className={isTransparent ? 'text-white' : 'text-[#1c1c1c]'} />
                                        {cartItems.length > 0 && (
                                            <span className="absolute top-0 right-0 bg-[#b58145] text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white shadow-sm">
                                                {cartItems.length > 99 ? '99+' : cartItems.length}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* DESKTOP TOP ROW (hidden md:flex) — Untouched Brand Layout   */}
                    {/* ============================================================ */}
                    <div className="hidden md:flex items-center justify-between gap-6 lg:gap-12">
                        {/* Logo (Left on desktop) */}
                        <Link to="/" className="flex items-center flex-shrink-0 min-w-[120px] lg:min-w-[140px] relative h-12 z-20">
                            <img
                                src="/logo.jpeg"
                                alt="Ownvibes Logo"
                                className={`w-auto object-cover rounded-full shadow-md transition-all duration-300 ${isScrolled ? 'h-11' : 'h-14 lg:h-16'}`}
                                loading="lazy"
                                decoding="async"
                            />
                        </Link>

                        {/* Desktop Navigation Links (Centered) */}
                        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 flex-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`text-[13px] font-bold transition-colors duration-200 
                                        ${isActive
                                                ? 'text-[#b58145]'
                                                : isTransparent
                                                    ? 'text-white hover:text-[#b58145] [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]'
                                                    : 'text-[#1c1c1c] hover:text-[#b58145]'}`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop Icons (Right) */}
                        <div className={`flex items-center gap-4 lg:gap-7 ${isTransparent ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-[#1c1c1c]'} flex-shrink-0`}>
                            {/* Expanding Search (Desktop) */}
                            <div className="flex items-center relative">
                                <div className={`hidden md:flex overflow-hidden transition-all duration-300 items-center bg-[#faf8f5] rounded-full border border-gray-200 absolute right-8 ${isSearchExpanded ? 'w-48 lg:w-64 px-4 py-2 opacity-100' : 'w-0 opacity-0 border-transparent pointer-events-none'}`}>
                                    <form onSubmit={handleSearch} className="flex w-full">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            className="w-full bg-transparent outline-none text-[13px] text-[#483d36] font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus={isSearchExpanded}
                                        />
                                    </form>
                                </div>

                                <button
                                    className={`${isTransparent ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-[#1c1c1c]'} hover:text-[#c1865a] transition-colors p-1`}
                                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                                    aria-label="Toggle search input"
                                >
                                    {isSearchExpanded ? <X size={22} strokeWidth={1.5} /> : <Search size={22} strokeWidth={1.5} />}
                                </button>
                            </div>

                            {/* Wishlist */}
                            <Link to="/wishlist" className="relative hover:text-[#c1865a] transition-colors flex flex-col items-center gap-1">
                                <div className="relative">
                                    <Heart size={22} strokeWidth={1.5} />
                                    {wishlistItems.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#ef4c7f] text-white text-[8px] md:text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                            {wishlistItems.length}
                                        </span>
                                    )}
                                </div>
                                <span className={`hidden sm:block text-[10px] font-medium ${isTransparent ? '[text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]' : ''}`}>Wishlist</span>
                            </Link>

                            {/* Orders */}
                            <Link to={userInfo ? "/my-orders" : "/login"} className="hover:text-[#c1865a] transition-colors hidden sm:flex flex-col items-center gap-1">
                                <Package size={22} strokeWidth={1.5} />
                                <span className={`text-[10px] font-medium ${isTransparent ? '[text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]' : ''}`}>My Orders</span>
                            </Link>

                            {/* Profile */}
                            <Link to={userInfo ? "/profile" : "/login"} className="hover:text-[#c1865a] transition-colors hidden sm:flex flex-col items-center gap-1">
                                <User size={22} strokeWidth={1.5} />
                                <span className={`text-[10px] font-medium ${isTransparent ? '[text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]' : ''}`}>My Profile</span>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative hover:text-[#c1865a] transition-colors flex flex-col items-center gap-1">
                                <div className="relative">
                                    <ShoppingCart size={22} strokeWidth={1.5} />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#b58145] text-white text-[8px] md:text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </div>
                                <span className={`hidden sm:block text-[10px] font-medium ${isTransparent ? '[text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]' : ''}`}>Cart</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay Drawer */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white z-40 border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2">
                        <div className="p-4 flex flex-col gap-4">
                            <form onSubmit={handleSearch} className="flex w-full rounded-md bg-[#faf8f5] border border-gray-200 px-4 py-3 items-center">
                                <input
                                    type="text"
                                    placeholder="Search for t-shirts..."
                                    className="flex-1 bg-transparent text-sm text-[#1c1c1c] font-medium outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="text-[#c1865a]">
                                    <Search size={18} strokeWidth={2.5} />
                                </button>
                            </form>

                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    navigate('/shop');
                                }}
                                className="w-full bg-[#b58145] text-white px-4 py-3 flex items-center justify-between font-semibold text-sm rounded-md"
                            >
                                <div className="flex items-center gap-2">
                                    <Menu size={18} />
                                    Shop All Categories
                                </div>
                                <ChevronRight size={16} />
                            </button>

                            <nav className="flex flex-col gap-1 mt-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 text-sm font-bold text-[#1c1c1c] hover:bg-[#faf8f5] hover:text-[#b58145] rounded-md flex items-center justify-between"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
};

export default Navbar;
