import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sparkles, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const BottomNav = () => {
    const { cartItems } = useCart();
    const { wishlistItems } = useWishlist();
    const location = useLocation();

    // Hide bottom nav on admin routes, reels, and final payment screen
    if (
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/reels') ||
        location.pathname === '/checkout/payment'
    ) {
        return null;
    }

    const token = localStorage.getItem('userToken');

    const navItems = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Shop', icon: Sparkles, path: '/shop' },
        { name: 'Wishlist', icon: Heart, path: '/wishlist', badge: wishlistItems?.length },
        { name: 'Cart', icon: ShoppingBag, path: '/cart', badge: cartItems?.length },
        { name: 'Account', icon: User, path: token ? '/profile' : '/login' }
    ];

    const handleTabClick = (path) => {
        // Native micro-haptic feedback
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(8);
        }

        // Tap-to-top behavior if user taps the active tab
        if (location.pathname === path) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav
            aria-label="Mobile Navigation"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-t border-gray-200/70 dark:border-gray-800 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] select-none"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
        >
            <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const isActive =
                        item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => handleTabClick(item.path)}
                            className={`group flex-1 flex flex-col items-center justify-center py-1 relative transition-all duration-200 active:scale-95 ${isActive ? 'text-[#cf7e28]' : 'text-gray-500 hover:text-[#cf7e28]'
                                }`}
                        >
                            {/* Icon Wrapper */}
                            <div className="relative mb-0.5">
                                <item.icon
                                    size={21}
                                    strokeWidth={isActive ? 2.3 : 1.8}
                                    className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}
                                />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#cf7e28] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#121212] shadow-sm animate-in zoom-in-50">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`text-[10px] tracking-tight transition-all duration-200 ${isActive ? 'font-bold text-[#cf7e28]' : 'font-medium text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {item.name}
                            </span>

                            {/* Active dot indicator */}
                            {isActive && (
                                <span className="absolute bottom-0.5 w-1 h-1 bg-[#cf7e28] rounded-full shadow-[0_0_6px_#cf7e28]" />
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
