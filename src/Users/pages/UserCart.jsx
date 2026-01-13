import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import './UserCart.css';

export default function UserCart() {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

    const cartItems = Object.entries(cart).map(([id, item]) => ({
        id,
        ...item
    }));

    const handleIncrement = (itemId) => {
        const currentQty = cart[itemId].quantity;
        updateQuantity(itemId, currentQty + 1);
    };

    const handleDecrement = (itemId) => {
        const currentQty = cart[itemId].quantity;
        if (currentQty > 1) {
            updateQuantity(itemId, currentQty - 1);
        }
    };

    const handleProceedToPayment = () => {
        navigate('/users/payment');
    };

    if (cartItems.length === 0) {
        return (
            <div className="user-cart-container">
                {/* Header */}
                <div className="cart-header">
                    <button
                        onClick={() => navigate('/users/menu')}
                        className="btn-back"
                    >
                        <ArrowLeft size={18} />
                        Back to Menu
                    </button>
                    <h1 className="cart-title">
                        Your Cart
                    </h1>
                </div>

                {/* Empty State */}
                <div className="empty-cart-container">
                    <ShoppingBag size={64} className="empty-cart-icon" />
                    <h3 className="empty-cart-title">Your cart is empty</h3>
                    <p className="empty-cart-text">Add some delicious items from the menu!</p>
                    <button
                        onClick={() => navigate('/users/menu')}
                        className="btn-browse-menu"
                    >
                        Browse Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-cart-container">
            {/* Header */}
            <div className="cart-header">
                <button
                    onClick={() => navigate('/users/menu')}
                    className="btn-back"
                >
                    <ArrowLeft size={18} />
                    Back to Menu
                </button>
                <div className="cart-title-wrapper">
                    <h1 className="cart-title">
                        Your Cart
                    </h1>
                    <button
                        onClick={clearCart}
                        className="btn-clear-cart"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items-list">
                {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                        {/* Item Image */}
                        <div className="cart-item-image-wrapper">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="cart-item-image" />
                            ) : (
                                <div className="cart-item-placeholder">
                                    <ShoppingBag size={40} />
                                </div>
                            )}
                        </div>

                        {/* Item Details */}
                        <div className="cart-item-details">
                            <h3 className="cart-item-name">
                                {item.name}
                            </h3>
                            <div className="cart-item-price-info">
                                <div className="price-calculation">
                                    ₹{item.price} × {item.quantity}
                                </div>
                                <div className="total-item-price">
                                    ₹{item.price * item.quantity}
                                </div>
                            </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="cart-item-controls">
                            <div className="qty-controls">
                                <button
                                    onClick={() => handleDecrement(item.id)}
                                    className="btn-cart-qty minus"
                                >
                                    <Minus size={18} strokeWidth={2.5} />
                                </button>
                                <span className="cart-qty-display">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => handleIncrement(item.id)}
                                    className="btn-cart-qty plus"
                                >
                                    <Plus size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="btn-cart-delete"
                            >
                                <Trash2 size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed Bottom Bar - Total & Checkout */}
            <div className="bottom-bar">
                <div className="bottom-bar-content">
                    <div>
                        <div className="total-label">Total Amount</div>
                        <div className="total-value">₹{getCartTotal()}</div>
                    </div>
                    <button
                        onClick={handleProceedToPayment}
                        className="btn-payment"
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    );
}
