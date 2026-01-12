import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import { useAuth } from '../../shared/context/AuthContext';
import { Trash2, ArrowLeft, CreditCard, Banknote, ShoppingBag } from 'lucide-react'; // Assuming icons exist
import { subscribeToOrders } from '../../shared/services/orderService'; // Will add createOrder later

export default function UserCart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'online'
    const [isProcessing, setIsProcessing] = useState(false);

    const total = getCartTotal();
    const cartItems = Object.entries(cart).map(([key, value]) => ({ id: key, ...value }));

    if (cartItems.length === 0) {
        return (
            <div style={{
                color: '#f8fafc',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8'
                }}>
                    <ShoppingBag size={40} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Your cart is empty</h2>
                    <p style={{ color: '#94a3b8' }}>Looks like you haven't added anything yet.</p>
                </div>
                <button
                    onClick={() => navigate('/users/menu')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        // Step 12: Payment Confirmation Logic
        if (paymentMode === 'online') {
            // TODO: GPay Intent
            const confirmed = window.confirm("Simulating GPay Payment... Click OK to Succeed.");
            if (!confirmed) return;
        }

        // Proceed to Order Creation (Step 13 & 14)
        setIsProcessing(true);
        try {
            // Call orderService to create order (will implement in next step)
            // await createOrder({ items: cartItems, total, paymentMode });

            // For now just log
            console.log("Ready to place order:", { items: cartItems, total, paymentMode });

            // Temporary alert for confirmation of Step 12
            alert("Payment Confirmed! Ready to generate token.");

        } catch (error) {
            console.error("Order failed:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ paddingBottom: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/users/menu')}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: '#f8fafc',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>Review Order</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                {/* Cart Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cartItems.map((item) => (
                        <div key={item.id} style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '1rem',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {/* Image */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '0.75rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                overflow: 'hidden'
                            }}>
                                {item.image || item.imageUrl ? (
                                    <img src={item.image || item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <ShoppingBag size={24} color="#64748b" />
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc', marginBottom: '0.25rem' }}>{item.name}</h3>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>₹{item.price} x {item.quantity}</div>
                            </div>

                            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#f8fafc' }}>
                                ₹{item.price * item.quantity}
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Checkout Panel */}
                <div>
                    <div style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        position: 'sticky',
                        top: '6rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1.5rem' }}>Payment Details</h2>

                        {/* Payment Mode Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                backgroundColor: paymentMode === 'cash' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                border: paymentMode === 'cash' ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.08)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="radio"
                                    name="paymentMode"
                                    value="cash"
                                    checked={paymentMode === 'cash'}
                                    onChange={() => setPaymentMode('cash')}
                                    style={{ accentColor: '#3b82f6', width: '1.2rem', height: '1.2rem' }}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f8fafc', fontWeight: '500' }}>
                                    <Banknote size={20} className="text-blue-400" />
                                    <span>Pay with Cash (Counter)</span>
                                </div>
                            </label>

                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                backgroundColor: paymentMode === 'online' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                border: paymentMode === 'online' ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.08)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="radio"
                                    name="paymentMode"
                                    value="online"
                                    checked={paymentMode === 'online'}
                                    onChange={() => setPaymentMode('online')}
                                    style={{ accentColor: '#3b82f6', width: '1.2rem', height: '1.2rem' }}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f8fafc', fontWeight: '500' }}>
                                    <CreditCard size={20} className="text-purple-400" />
                                    <span>Pay Online (UPI/GPay)</span>
                                </div>
                            </label>
                        </div>

                        {/* Total */}
                        <div style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingTop: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: '#94a3b8' }}>Total Amount</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>₹{total}</span>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                backgroundColor: isProcessing ? '#475569' : '#3b82f6',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                border: 'none',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            {isProcessing ? 'Processing...' : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
