import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

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
    '/login': 'Sign In',
    '/register': 'Create Account',
    '/forgot-password': 'Reset Password',
};

const ROOT_PATHS = ['/', '/shop', '/wishlist', '/cart', '/profile'];

const NativeAppBar = ({ title: customTitle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { wishlistItems } = useWishlist();

    const pathname = location.pathname;

    // Do not show on admin routes or reels
    if (pathname.startsWith('/admin') || pathname.startsWith('/reels')) {
        return null;
    }

    // On home page, let the primary brand Navbar handle presentation
    if (pathname === '/') {
        return null;
    }

    const isRootTab = ROOT_PATHS.includes(pathname);
    const isPDP = pathname.startsWith('/product/');

    // Determine Title
    let displayTitle = customTitle;
    if (!displayTitle) {
        if (isPDP) {
            displayTitle = 'Product Details';
        } else {
            displayTitle = ROUTE_TITLES[pathname] || 'Ownvibes';
        }
    }

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
                // User dismissed share
            }
        }
    };

    return (
        <header
            className="md:hidden sticky top-0 z-40 w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-b border-gray-200/70 dark:border-gray-800 transition-colors"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
        >
            <div className="flex items-center justify-between h-13 px-3">
                {/* Left: Back Button or Brand Logo */}
                <div className="w-12 flex items-center justify-start">
                    {!isRootTab ? (
                        <button
                            onClick={handleBack}
                            aria-label="Go back"
                            className="p-2 -ml-1 text-gray-800 dark:text-gray-100 hover:text-[#cf7e28] active:scale-90 transition-all rounded-full"
                        >
                            <ChevronLeft size={24} strokeWidth={2.2} />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/')}
                            aria-label="Ownvibes Home"
                            className="flex items-center active:scale-95 transition-transform"
                        >
                            <img
                                src="/icons/icon-192.png"
                                alt="Ownvibes"
                                className="w-7 h-7 rounded-full object-cover shadow-sm"
                            />
                        </button>
                    )}
                </div>

                {/* Center: Title */}
                <div className="flex-1 text-center truncate px-2">
                    <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white truncate">
                        {displayTitle}
                    </h1>
                </div>

                {/* Right Action: Share on PDP, or Quick Cart/Wishlist */}
                <div className="w-12 flex items-center justify-end gap-1">
                    {isPDP && typeof navigator !== 'undefined' && 'share' in navigator ? (
                        <button
                            onClick={handleShare}
                            aria-label="Share product"
                            className="p-2 text-gray-700 dark:text-gray-200 hover:text-[#cf7e28] active:scale-90 transition-all rounded-full"
                        >
                            <Share2 size={19} strokeWidth={1.8} />
                        </button>
                    ) : !isRootTab && pathname !== '/cart' ? (
                        <button
                            onClick={() => navigate('/cart')}
                            aria-label="Cart"
                            className="relative p-2 text-gray-700 dark:text-gray-200 hover:text-[#cf7e28] active:scale-90 transition-all rounded-full"
                        >
                            <ShoppingBag size={20} strokeWidth={1.8} />
                            {cartCount > 0 && (
                                <span className="absolute 1 top-1 right-1 min-w-[15px] h-[15px] px-0.5 bg-[#cf7e28] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-black">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </button>
                    ) : (
                        <div className="w-5" />
                    )}
                </div>
            </div>
        </header>
    );
};

export default NativeAppBar;
