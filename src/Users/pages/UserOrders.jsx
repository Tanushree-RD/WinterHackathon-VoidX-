import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { db } from '../../shared/firebase/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ShoppingBag, Clock, CheckCircle2, Package, XCircle, ChevronRight, ArrowLeft, Banknote } from 'lucide-react';

const STATUS_COLORS = {
    pending: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', icon: <Clock size={16} /> },
    cash: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', icon: <Clock size={16} /> },
    preparing: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', icon: <Package size={16} /> },
    ready: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', icon: <CheckCircle2 size={16} /> },
    completed: { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', icon: <CheckCircle2 size={16} /> },
    cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', icon: <XCircle size={16} /> }
};

export default function UserOrders() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Using simple query to avoid composite index requirements
        const q = query(
            collection(db, 'Orders'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side to avoid index error
            ordersData.sort((a, b) => {
                const t1 = a.createdAt?.seconds || 0;
                const t2 = b.createdAt?.seconds || 0;
                return t2 - t1; // Descending (newest first)
            });

            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error("Orders listener error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="loader" style={{
                    width: '40px', height: '40px', border: '3px solid rgba(96, 165, 250, 0.2)',
                    borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '4rem' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <button
                    onClick={() => navigate('/users/menu')}
                    style={{
                        display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'transparent',
                        border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '1rem'
                    }}
                >
                    <ArrowLeft size={18} /> Back to Menu
                </button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '2rem', border: '2px dashed rgba(255, 255, 255, 0.05)' }}>
                    <ShoppingBag size={64} style={{ opacity: 0.1, color: '#f8fafc', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: '1rem' }}>No orders found</h3>
                    <button onClick={() => navigate('/users/menu')} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>
                        Place your first order
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map((order) => {
                        const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                        const date = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : null);

                        return (
                            <div key={order.id} style={{
                                backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '1.5rem', padding: '1.5rem', backdropFilter: 'blur(10px)',
                                transition: 'all 0.2s', cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#f8fafc', fontWeight: '700', fontSize: '1.125rem' }}>#{order.token || 'N/A'}</span>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem',
                                                borderRadius: '999px', backgroundColor: status.bg, color: status.text,
                                                fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                                            }}>
                                                {status.icon}
                                                {order.status}
                                            </div>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            {date ? date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Processing...'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#4ade80', fontWeight: '800', fontSize: '1.25rem' }}>₹{order.totalPrice || order.total}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{order.items?.length || 0} items</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} style={{
                                            flexShrink: 0, width: '50px', height: '50px', borderRadius: '0.5rem',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            {item.image ? (
                                                <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                                                    <ShoppingBag size={20} />
                                                </div>
                                            )}
                                            {item.quantity > 1 && (
                                                <div style={{
                                                    position: 'absolute', top: 0, right: 0, backgroundColor: '#3b82f6',
                                                    color: 'white', fontSize: '10px', padding: '1px 4px', borderRadius: '0.2rem'
                                                }}>
                                                    x{item.quantity}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        <Banknote size={16} />
                                        <span>Paid via {order.paymentMode === 'cash' ? 'Cash on Collection' : 'Online'}</span>
                                    </div>
                                    <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                                        Order ID: {order.orderNumber}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

}
