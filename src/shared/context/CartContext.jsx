import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

const CART_STORAGE_KEY = 'canteen_cart';

export function CartProvider({ children }) {
    const [cart, setCart] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            setCart({});
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Sync cart to localStorage on every change
    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
        }
    }, [cart, isInitialized]);

    // Add item to cart
    const addToCart = (itemId, quantity, itemData) => {
        setCart(prev => ({
            ...prev,
            [itemId]: {
                quantity,
                ...itemData
            }
        }));
    };

    // Update item quantity
    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart(prev => ({
                ...prev,
                [itemId]: {
                    ...prev[itemId],
                    quantity
                }
            }));
        }
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[itemId];
            return newCart;
        });
    };

    // Clear entire cart
    const clearCart = () => {
        setCart({});
    };

    // Get cart item count (distinct items)
    const getCartItemCount = () => {
        return Object.keys(cart).length;
    };

    // Get cart total
    const getCartTotal = () => {
        return Object.values(cart).reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    const value = {
        cart,
        isInitialized,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
        getCartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
