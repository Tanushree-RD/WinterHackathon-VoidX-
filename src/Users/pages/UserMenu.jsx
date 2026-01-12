import { useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useMenu } from '../../shared/context/MenuContext';
import { useCart } from '../../shared/context/CartContext';
import { Info, ShoppingBag, Plus, Minus, Check, Trash2 } from 'lucide-react';

export default function UserMenu() {
    const { user } = useAuth();
    const { activeMenuName, todayItems, loading: menuLoading } = useMenu();
    const { cart, isInitialized: cartInitialized, addToCart, removeFromCart } = useCart();

    // Local state for quantity selection
    const [selectingItemId, setSelectingItemId] = useState(null);
    const [tempQuantity, setTempQuantity] = useState(1);

    // Group items by their first tag
    const groupedItems = todayItems.reduce((acc, item) => {
        const tag = (item.tags && item.tags.length > 0) ? item.tags[0] : 'Other';
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(item);
        return acc;
    }, {});

    if (menuLoading || !cartInitialized) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '70vh',
                gap: '1rem'
            }}>
                <div className="loader" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(96, 165, 250, 0.2)',
                    borderTopColor: '#60a5fa',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: '500' }}>Preparing today's delights...</div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    const handleAddClick = (itemId) => {
        setSelectingItemId(itemId);
        setTempQuantity(1);
    };

    const handleCancel = () => {
        setSelectingItemId(null);
        setTempQuantity(1);
    };

    const handleConfirm = (item) => {
        addToCart(item.id, tempQuantity, {
            name: item.name,
            price: item.price,
            image: item.image || item.imageUrl
        });
        setSelectingItemId(null);
        setTempQuantity(1);
    };

    const handleDelete = (itemId) => {
        removeFromCart(itemId);
    };

    const incrementQuantity = () => {
        setTempQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (tempQuantity > 1) {
            setTempQuantity(prev => prev - 1);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '4rem' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Hero Section */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    color: '#f8fafc',
                    letterSpacing: '-0.025em'
                }}>
                    Ahoj, {user?.displayName?.split(' ')[0] || 'Friend'}! 👋
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                    Explore today's specific {activeMenuName} menu.
                </p>
            </div>

            {/* Menu Sections by Tag */}
            {todayItems.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '5rem 2rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '2px dashed rgba(255, 255, 255, 0.05)',
                    borderRadius: '2rem',
                    color: '#64748b'
                }}>
                    <Info size={48} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                    <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No items available right now</h3>
                    <p>The canteen kitchen is preparing the menu. Check back in a moment!</p>
                </div>
            ) : (
                Object.entries(groupedItems).map(([tag, items]) => (
                    <div key={tag} style={{ marginBottom: '3.5rem' }}>
                        {/* Tag Header */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{
                                    width: '4px',
                                    height: '24px',
                                    background: 'linear-gradient(to bottom, #60a5fa, #a855f7)',
                                    borderRadius: '2px',
                                    boxShadow: '0 0 15px rgba(96, 165, 250, 0.5)'
                                }}></div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                                    {tag}
                                </h2>
                            </div>
                            <div style={{
                                height: '1px',
                                width: '100%',
                                background: 'linear-gradient(to right, rgba(96, 165, 250, 0.5), transparent)'
                            }}></div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '2rem'
                        }}>
                            {items.map((item) => {
                                const isInCart = cart[item.id];
                                const isSelecting = selectingItemId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.4)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '1.5rem',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelecting) {
                                                e.currentTarget.style.transform = 'translateY(-6px)';
                                                e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelecting) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {/* Image */}
                                        <div style={{ height: '180px', backgroundColor: 'rgba(255, 255, 255, 0.02)', position: 'relative' }}>
                                            {item.image || item.imageUrl ? (
                                                <img src={item.image || item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(96, 165, 250, 0.2)' }}>
                                                    <ShoppingBag size={48} />
                                                </div>
                                            )}
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)'
                                            }}></div>
                                        </div>

                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#f8fafc' }}>
                                                {item.name}
                                            </h3>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: '800',
                                                    color: '#4ade80',
                                                    textShadow: '0 0 20px rgba(74, 222, 128, 0.3)'
                                                }}>
                                                    ₹{item.price}
                                                </div>

                                                {/* STATE A: Default - Add Button */}
                                                {!isInCart && !isSelecting && (
                                                    <button
                                                        onClick={() => handleAddClick(item.id)}
                                                        style={{
                                                            padding: '0.6rem 1.25rem',
                                                            borderRadius: '1rem',
                                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                                            color: '#60a5fa',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.backgroundColor = '#3b82f6';
                                                            e.target.style.color = 'white';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                                            e.target.style.color = '#60a5fa';
                                                        }}
                                                    >
                                                        Add
                                                    </button>
                                                )}

                                                {/* STATE B: Selecting - Quantity Picker */}
                                                {isSelecting && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <button
                                                            onClick={decrementQuantity}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
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
                                                            <Minus size={16} strokeWidth={2.5} />
                                                        </button>
                                                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', color: '#f8fafc' }}>
                                                            {tempQuantity}
                                                        </span>
                                                        <button
                                                            onClick={incrementQuantity}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
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
                                                            <Plus size={16} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* STATE C: Added - Delete Icon */}
                                                {isInCart && !isSelecting && (
                                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.5rem 0.75rem',
                                                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                                            borderRadius: '0.75rem',
                                                            color: '#22c55e',
                                                            fontWeight: '700',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            <Check size={16} strokeWidth={2.5} />
                                                            Added
                                                        </div>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                borderRadius: '0.75rem',
                                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s',
                                                                padding: 0
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
                                                            <Trash2 size={18} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selecting State Actions */}
                                            {isSelecting && (
                                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                                    <button
                                                        onClick={handleCancel}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.75rem',
                                                            borderRadius: '0.75rem',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            color: '#94a3b8',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleConfirm(item)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.75rem',
                                                            borderRadius: '0.75rem',
                                                            backgroundColor: '#3b82f6',
                                                            border: 'none',
                                                            color: 'white',
                                                            fontWeight: '700',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* Step Status */}
            <div style={{
                marginTop: '6rem', padding: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#475569', fontSize: '0.75rem', textAlign: 'center', opacity: 0.5
            }}>
                CART PERSISTENCE ACTIVE • MENU RESOLVED ({todayItems.length}) • STEP 4 COMPLETE
            </div>
        </div>
    );
}
