import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        const token = localStorage.getItem('userToken');
        if (!token || token === 'null' || token === 'undefined') {
            window.location.href = '/login';
            return;
        }
        setWishlistItems(prevItems => {
            const productId = product._id || product.id;
            const existItem = prevItems.find(x => (x._id || x.id) === productId);
            if (existItem) {
                return prevItems;
            } else {
                return [...prevItems, product];
            }
        });
    };

    const removeFromWishlist = (id) => {
        setWishlistItems(prevItems => prevItems.filter(x => (x._id || x.id) !== id));
    };
    
    const toggleWishlist = (product) => {
        const token = localStorage.getItem('userToken');
        if (!token || token === 'null' || token === 'undefined') {
            window.location.href = '/login';
            return;
        }
        setWishlistItems(prevItems => {
            const productId = product._id || product.id;
            const existItem = prevItems.find(x => (x._id || x.id) === productId);
            if (existItem) {
                return prevItems.filter(x => (x._id || x.id) !== productId);
            } else {
                return [...prevItems, product];
            }
        });
    }

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    const isInWishlist = (id) => {
        if (!id) return false;
        return wishlistItems.some(x => (x._id || x.id) === id);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            clearWishlist,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
