import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useCart } from '../../shared/context/CartContext';
import { db } from '../../shared/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateToken } from '../../shared/services/orderService';
import { ArrowLeft, CreditCard, Banknote, ShieldCheck, ShoppingBag, Loader2 } from 'lucide-react';
import './UserPayment.css';

export default function UserPayment() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'online'

    const cartItems = Object.entries(cart).map(([id, item]) => ({
        id,
        ...item
    }));

    const total = getCartTotal();

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;

        setLoading(true);
        try {
            // Generate token atomically from Firestore
            const token = await generateToken();
            const orderNumber = token.toString(); // Use token as Order Id as per requirements

            const orderData = {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Anonymous User',
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || ''
                })),
                totalPrice: total,
                paymentMode: paymentMethod,
                status: paymentMethod === 'cash' ? 'cash' : 'paid',
                createdAt: serverTimestamp(),
                orderNumber: orderNumber,
                token: token,
                Token: token, // Redundant but follows Step 14 "Token: token"
                OrderId: token // Follows Step 14 "OrderId: token"
            };

            // Step 14: Order Creation
            await addDoc(collection(db, 'Orders'), orderData);

            // Step 15: Post-Order Cleanup
            clearCart();

            // Navigate to success page or orders page
            navigate('/users/orders', { state: { orderPlaced: true, orderNumber } });
        } catch (error) {
            console.error("Error placing order:", error);
            alert(`Failed to place order: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !loading) {
        return (
            <div className="empty-cart-state">
                <h2 className="empty-title">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/users/menu')}
                    className="btn-return-menu"
                >
                    Return to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="user-payment-container">
            {/* Header */}
            <div className="payment-header">
                <button
                    onClick={() => navigate('/users/cart')}
                    className="btn-back"
                >
                    <ArrowLeft size={18} />
                    Back to Cart
                </button>
                <h1 className="payment-title">
                    Checkout
                </h1>
            </div>

            <div className="payment-layout">
                {/* Left Column: Payment & Order Details */}
                <div className="payment-left-col">

                    {/* Payment Method Selection */}
                    <div className="payment-method-card">
                        <h2 className="payment-method-title">
                            <CreditCard size={24} color="#60a5fa" />
                            Payment Method
                        </h2>

                        <div className="method-options">
                            {/* Cash on Collection */}
                            <div
                                onClick={() => setPaymentMethod('cash')}
                                className={`method-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                            >
                                <div className="method-icon-wrapper">
                                    <Banknote size={24} />
                                </div>
                                <div className="method-details">
                                    <div className="method-name">Cash on Collection</div>
                                    <div className="method-desc">Pay at the counter when you pick up</div>
                                </div>
                                <div className="selection-indicator">
                                    {paymentMethod === 'cash' && <div className="selection-dot"></div>}
                                </div>
                            </div>

                            {/* Online Payment (Disabled/Placeholder) */}
                            <div className="method-option disabled">
                                <div className="method-icon-wrapper">
                                    <CreditCard size={24} />
                                </div>
                                <div className="method-details">
                                    <div className="method-name">Online Payment (UPI/Cards)</div>
                                    <div className="method-desc">Coming soon</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary in Left Column for Mobile/Compact */}
                    <div className="secure-badge">
                        <ShieldCheck size={32} color="#4ade80" />
                        <div>
                            <div className="secure-badge-text">Secure Checkout</div>
                            <div className="secure-badge-subtext">Your order will be sent directly to the kitchen.</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summaries & Actions */}
                <div className="payment-right-col">
                    <div className="order-summary-card">
                        <h2 className="summary-title">Order Summary</h2>

                        <div className="summary-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="summary-item">
                                    <div className="summary-item-left">
                                        <div className="summary-item-image">
                                            {item.image ? <img src={item.image} className="summary-img" /> : <ShoppingBag size={16} />}
                                        </div>
                                        <div>
                                            <div className="summary-item-name">{item.name}</div>
                                            <div className="summary-item-qty">Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="summary-item-price">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="summary-row">
                                <span>Handling Fee</span>
                                <span className="free-text">Free</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span className="total-amount">₹{total}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cartItems.length === 0}
                            className="btn-confirm-order"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Placing Order...
                                </>
                            ) : (
                                `Confirm Order (₹${total})`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
