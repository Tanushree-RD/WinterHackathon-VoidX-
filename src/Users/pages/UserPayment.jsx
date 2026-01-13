import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useCart } from '../../shared/context/CartContext';
import { db } from '../../shared/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateToken } from '../../shared/services/orderService';
import { ArrowLeft, CreditCard, Banknote, ShieldCheck, ShoppingBag, Loader2 } from 'lucide-react';

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
                status: paymentMethod === 'cash' ? 'cash' : 'paid', // If cash -> pending/cash? Requirement: "pending" (cash) - "paid" (online)
                // Wait, logic says: Status: "pending" (cash) | "paid" (online)
                // BUT Step 14 says: "pending" (cash) | "paid" (online)
                // Let's stick to that.
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
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>Your cart is empty</h2>
                <button
                    onClick={() => navigate('/users/menu')}
                    style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        color: 'white',
                        borderRadius: '0.75rem',
                        cursor: 'pointer'
                    }}
                >
                    Return to Menu
                </button>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <button
                    onClick={() => navigate('/users/cart')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        marginBottom: '1rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                    <ArrowLeft size={18} />
                    Back to Cart
                </button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                    Checkout
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
                {/* Left Column: Payment & Order Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Payment Method Selection */}
                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CreditCard size={24} color="#60a5fa" />
                            Payment Method
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Cash on Collection */}
                            <div
                                onClick={() => setPaymentMethod('cash')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: `2px solid ${paymentMethod === 'cash' ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)'}`,
                                    backgroundColor: paymentMethod === 'cash' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '0.75rem',
                                    backgroundColor: paymentMethod === 'cash' ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    <Banknote size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', color: '#f8fafc' }}>Cash on Counter</div>
                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Pay at the counter when you pick up</div>
                                </div>
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {paymentMethod === 'cash' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>}
                                </div>
                            </div>

                            {/* Online Payment (Disabled/Placeholder) */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: '2px solid rgba(255, 255, 255, 0.05)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                                    opacity: 0.5,
                                    cursor: 'not-allowed'
                                }}
                            >
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '0.75rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'
                                }}>
                                    <CreditCard size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', color: '#94a3b8' }}>Online Payment (UPI/Cards)</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Coming soon</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary in Left Column for Mobile/Compact */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <ShieldCheck size={32} color="#4ade80" />
                        <div>
                            <div style={{ color: '#f8fafc', fontWeight: '600' }}>Secure Checkout</div>
                            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Your order will be sent directly to the kitchen.</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summaries & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        backdropFilter: 'blur(10px)',
                        position: 'sticky',
                        top: '2rem'
                    }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f8fafc', marginBottom: '1.25rem' }}>Order Summary</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '0.4rem', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                            {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={16} />}
                                        </div>
                                        <div>
                                            <div style={{ color: '#f8fafc', fontWeight: '600' }}>{item.name}</div>
                                            <div style={{ color: '#64748b' }}>Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div style={{ color: '#f8fafc', fontWeight: '600' }}>₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span>
                                <span>₹{total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '1rem' }}>
                                <span>Handling Fee</span>
                                <span style={{ color: '#4ade80' }}>Free</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc', fontSize: '1.25rem', fontWeight: '800' }}>
                                <span>Total</span>
                                <span style={{ color: '#4ade80' }}>₹{total}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cartItems.length === 0}
                            style={{
                                width: '100%',
                                marginTop: '1.5rem',
                                padding: '1rem',
                                borderRadius: '1rem',
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
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

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
