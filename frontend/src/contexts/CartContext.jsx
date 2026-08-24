import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, qty = 1) => {
        setCartItems(prevItems => {
            const uniqueId = product.selectedSize ? `${product._id}-${product.selectedSize}` : product._id;
            const existItem = prevItems.find(x => {
                const xId = x.selectedSize ? `${x._id}-${x.selectedSize}` : x._id;
                return xId === uniqueId;
            });
            
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
