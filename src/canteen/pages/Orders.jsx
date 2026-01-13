import { useState, useEffect } from 'react';
import { subscribeToOrders, updateOrderStatus, createTestOrder } from '../../shared/services/orderService';
import { Clock, ChevronDown, Check } from 'lucide-react';
import './Orders.css';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        const unsub = subscribeToOrders((newOrders) => {
            setOrders(newOrders);
            setLoading(false);
        });
        return () => unsub && unsub();
    }, []);

    const [undoData, setUndoData] = useState(null);

    const toggleExpand = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Filtered lists
    const cashOrders = orders.filter(o => o.status === 'cash' || o.status === 'pending');
    const paidOrders = orders.filter(o => o.status === 'paid');

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleMarkPaid = async (orderId) => {
        // Optimistic update or just wait for firestore
        await updateOrderStatus(orderId, 'paid');
        setUndoData({ id: orderId, timer: 5, action: 'paid', fromStatus: 'cash' });
    };

    const handlePicked = async (orderId) => {
        await updateOrderStatus(orderId, 'picked');
        setUndoData({ id: orderId, timer: 5, action: 'picked', fromStatus: 'paid' });
    };

    const handleUndo = async () => {
        if (undoData) {
            await updateOrderStatus(undoData.id, undoData.fromStatus);
            setUndoData(null);
        }
    };

    const moveOrder = (id, status) => updateOrderStatus(id, status);

    // Countdown effect for undo
    useEffect(() => {
        if (undoData) {
            const interval = setInterval(() => {
                setUndoData(prev => {
                    if (!prev || prev.timer <= 1) return null;
                    return { ...prev, timer: prev.timer - 1 };
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [undoData]);

    if (loading) return <div className="loading-container">Loading orders...</div>;

    return (
        <div className="orders-container">
            {/* Left Column: Cash on Counter */}
            <div className="orders-column">
                <div className="orders-header">
                    <h2>Cash on Counter <span className="count-badge">{cashOrders.length}</span></h2>
                    {/* Dev tool to add orders */}

                </div>
                <div className="orders-list">
                    {cashOrders.length === 0 && <div className="no-orders">No pending cash orders</div>}
                    {cashOrders.map(order => (
                        <div key={order.id} className="order-card">
                            <div
                                className="order-card-header"
                                onClick={() => toggleExpand(order.id)}
                            >
                                <span className="order-token">Token #{order.token || '---'}</span>
                                <div className="header-actions">
                                    <button
                                        className="btn-header-action btn-expand"
                                        title="Expand/Collapse Details"
                                        style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                                    >
                                        <img
                                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"
                                            alt="Expand"
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                transform: expandedOrders[order.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s ease',
                                                display: 'block'
                                            }}
                                        />
                                    </button>
                                    <button
                                        className="btn-header-action btn-paid"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkPaid(order.id);
                                        }}
                                        title="Mark as Paid"
                                        style={{ backgroundColor: '#dcfce7' }}
                                    >
                                        <img
                                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E"
                                            alt="Mark Paid"
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                display: 'block'
                                            }}
                                        />
                                    </button>
                                </div>
                            </div>

                            {expandedOrders[order.id] && (
                                <div className="order-details-expanded">
                                    <div className="order-time-info">
                                        <Clock size={12} style={{ marginRight: 4 }} />
                                        {formatTime(order.createdAt)}
                                    </div>
                                    <div className="order-items">
                                        {(!order.items || order.items.length === 0) ? (
                                            <div className="no-items-text">No items in order</div>
                                        ) : (
                                            order.items.map((item, idx) => (
                                                <div key={idx} className="order-item-row">
                                                    <span><span className="item-qty">{item.quantity}x</span> {item.name}</span>
                                                    <span>₹{(item.price || 0) * (item.quantity || 0)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="order-total">
                                        <span className="total-label">Total Amount</span>
                                        <span className="total-amount">₹{order.totalPrice || order.total || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Paid Orders */}
            <div className="orders-column">
                <div className="orders-header">
                    <h2>Paid Orders <span className="count-badge">{paidOrders.length}</span></h2>
                </div>
                <div className="orders-list">
                    {paidOrders.length === 0 && <div className="no-orders">No paid orders yet</div>}
                    {paidOrders.map(order => (
                        <div key={order.id} className="order-card paid-card">
                            <div className="order-card-header mb-4">
                                <span className="order-token">Token #{order.token || '---'}</span>
                                <span className="order-time">{formatTime(order.createdAt)}</span>
                            </div>

                            <div className="order-items mb-6">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="order-item-row border-b-light">
                                        <span><span className="item-qty">{item.quantity}x</span> {item.name}</span>
                                    </div>
                                ))}
                                {(!order.items || order.items.length === 0) && (
                                    <div className="no-items-text">No items in order</div>
                                )}
                            </div>

                            <div className="order-total paid-total">
                                <span className="total-label-success">{order.paymentMode?.toUpperCase()} PAID</span>
                                <span className="total-amount-large">₹{order.totalPrice || order.total || 0}</span>
                            </div>

                            <div className="order-actions">
                                <button
                                    className="btn-action btn-picked"
                                    onClick={() => handlePicked(order.id)}
                                >
                                    Finish Order
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Undo Toast */}
            {undoData && (
                <div className="undo-toast">
                    <span>{undoData.action === 'paid' ? 'Marked as Paid.' : 'Order Picked.'}</span>
                    <button className="undo-btn" onClick={handleUndo}>Undo ({undoData.timer}s)</button>
                </div>
            )}
        </div>
    );
}
