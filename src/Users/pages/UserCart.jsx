import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

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
        // Navigate to payment page
        navigate('/users/payment');
    };

    if (cartItems.length === 0) {
        return (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/users/menu')}
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
                        Back to Menu
                    </button>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                        Your Cart
                    </h1>
                </div>

                {/* Empty State */}
                <div style={{
                    textAlign: 'center',
                    padding: '5rem 2rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '2px dashed rgba(255, 255, 255, 0.05)',
                    borderRadius: '2rem'
                }}>
                    <ShoppingBag size={64} style={{ marginBottom: '1.5rem', opacity: 0.3, color: '#64748b' }} />
                    <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Your cart is empty</h3>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Add some delicious items from the menu!</p>
                    <button
                        onClick={() => navigate('/users/menu')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '1rem',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            color: 'white',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Browse Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '8rem' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/users/menu')}
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
                    Back to Menu
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                        Your Cart
                    </h1>
                    <button
                        onClick={clearCart}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            display: 'flex',
                            gap: '1.5rem',
                            alignItems: 'center',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {/* Item Image */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '1rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            {item.image ? (
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(96, 165, 250, 0.2)' }}>
                                    <ShoppingBag size={40} />
                                </div>
                            )}
                        </div>

                        {/* Item Details */}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.5rem' }}>
                                {item.name}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                    ₹{item.price} × {item.quantity}
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4ade80' }}>
                                    ₹{item.price * item.quantity}
                                </div>
                            </div>
                        </div>

                        {/* Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => handleDecrement(item.id)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0
                                    }}
                                >
                                    <Minus size={18} strokeWidth={2.5} />
                                </button>
                                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: '700', fontSize: '1.125rem', color: '#f8fafc' }}>
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => handleIncrement(item.id)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        color: '#22c55e',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0
                                    }}
                                >
                                    <Plus size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '0.75rem',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ef4444';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                            >
                                <Trash2 size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed Bottom Bar - Total & Checkout */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                zIndex: 50
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Amount</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4ade80' }}>₹{getCartTotal()}</div>
                    </div>
                    <button
                        onClick={handleProceedToPayment}
                        style={{
                            padding: '1rem 3rem',
                            borderRadius: '1rem',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    );
}
