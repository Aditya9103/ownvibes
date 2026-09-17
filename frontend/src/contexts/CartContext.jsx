import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getOfflineCart, saveOfflineCart, clearOfflineCart } from '../offline/db';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Fallback hydration from IndexedDB if localStorage was empty
    useEffect(() => {
        if (cartItems.length === 0) {
            getOfflineCart().then((items) => {
                if (items && items.length > 0) {
                    setCartItems(items);
                    localStorage.setItem('cart', JSON.stringify(items));
                }
            });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        saveOfflineCart(cartItems);
    }, [cartItems]);

    const addToCart = (product, qty = 1) => {
        setCartItems(prevItems => {
            const uniqueId = product.selectedSize ? `${product._id}-${product.selectedSize}` : product._id;
            const existItem = prevItems.find(x => {
                const xId = x.selectedSize ? `${x._id}-${x.selectedSize}` : x._id;
                return xId === uniqueId;
            });
            
            toast.success(`${product.name} added to cart!`);
            
            if (existItem) {
                return prevItems.map(x => {
                    const xId = x.selectedSize ? `${x._id}-${x.selectedSize}` : x._id;
                    return xId === uniqueId ? { ...x, qty: x.qty + qty } : x;
                });
            } else {
                return [...prevItems, { ...product, qty }];
            }
        });
    };

    const removeFromCart = (id, size = null) => {
        const uniqueId = size ? `${id}-${size}` : id;
        setCartItems(prevItems => prevItems.filter(x => {
            const xId = x.selectedSize ? `${x._id}-${x.selectedSize}` : x._id;
            return xId !== uniqueId;
        }));
        toast.info("Item removed from cart");
    };

    const updateQty = (id, qty, size = null) => {
        const uniqueId = size ? `${id}-${size}` : id;
        setCartItems(prevItems =>
            prevItems.map(x => {
                const xId = x.selectedSize ? `${x._id}-${x.selectedSize}` : x._id;
                return xId === uniqueId ? { ...x, qty } : x;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
        clearOfflineCart();
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQty,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
