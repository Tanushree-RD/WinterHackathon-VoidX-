import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { db } from '../../shared/firebase/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ShoppingBag, Clock, CheckCircle2, Package, XCircle, ChevronRight, ArrowLeft, Banknote } from 'lucide-react';
import './UserOrders.css';

const STATUS_COLORS = {
    pending: { bg: 'rgba(234, 179, 8, 0.1)', text: '#d97706', icon: <Clock size={16} /> },
    cash: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', icon: <Banknote size={16} /> },
    preparing: { bg: 'rgba(249, 115, 22, 0.1)', text: '#ea580c', icon: <Package size={16} /> },
    ready: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a', icon: <CheckCircle2 size={16} /> },
    completed: { bg: 'rgba(148, 163, 184, 0.1)', text: '#64748b', icon: <CheckCircle2 size={16} /> },
    cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', icon: <XCircle size={16} /> }
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
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="user-orders-container">
            {/* Header */}
            <div className="orders-header">
                <button
                    onClick={() => navigate('/users/menu')}
                    className="btn-back"
                >
                    <ArrowLeft size={18} /> Back to Menu
                </button>
                <h1 className="orders-title">My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="empty-orders-state">
                    <ShoppingBag size={64} className="empty-orders-icon" />
                    <h3 className="empty-orders-title">No orders found</h3>
                    <button onClick={() => navigate('/users/menu')} className="btn-start-order">
                        Place your first order
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => {
                        const status = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                        const date = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : null);

                        return (
                            <div key={order.id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-card-info">
                                        <div className="order-token-line">
                                            <span className="order-token">#{order.token || 'N/A'}</span>
                                            <div style={{
                                                backgroundColor: status.bg,
                                                color: status.text
                                            }} className="order-status-badge">
                                                {status.icon}
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="order-date">
                                            {date ? date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Processing...'}
                                        </div>
                                    </div>
                                    <div className="order-card-total">
                                        <div className="order-total-amount">₹{order.totalPrice || order.total}</div>
                                        <div className="order-items-count">{order.items?.length || 0} items</div>
                                    </div>
                                </div>

                                <div className="order-items-scroll">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="order-item-preview">
                                            {item.image ? (
                                                <img src={item.image} className="order-item-img" />
                                            ) : (
                                                <div className="order-item-placeholder">
                                                    <ShoppingBag size={20} />
                                                </div>
                                            )}
                                            {item.quantity > 1 && (
                                                <div className="item-qty-badge">
                                                    x{item.quantity}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

<<<<<<< HEAD
                                <div className="order-card-footer">
                                    <div className="payment-mode-info">
=======
                                <div style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: idx === order.items.length - 1 ? 0 : '0.5rem',
                                            paddingBottom: idx === order.items.length - 1 ? 0 : '0.5rem',
                                            borderBottom: idx === order.items.length - 1 ? 'none' : '1px dashed rgba(255, 255, 255, 0.1)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '6px', height: '6px', borderRadius: '50%',
                                                    backgroundColor: '#3b82f6', opacity: 0.5
                                                }}></div>
                                                <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{item.name}</span>
                                                <span style={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    color: '#94a3b8',
                                                    fontSize: '0.75rem',
                                                    padding: '0 6px',
                                                    borderRadius: '4px'
                                                }}>x{item.quantity}</span>
                                            </div>
                                            <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '500' }}>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
>>>>>>> 9025409c4e58618e4556746cdcd510ccda5ccd42
                                        <Banknote size={16} />
                                        <span>Paid via {order.paymentMode === 'cash' ? 'Cash on Counter' : 'Online'}</span>
                                    </div>
                                    <div className="order-id-display">
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
