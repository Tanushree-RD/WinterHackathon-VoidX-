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
                    <button onClick={createTestOrder} className="btn-test-order">+ Test</button>
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
                                    >
                                        <ChevronDown
                                            size={24}
                                            strokeWidth={3}
                                            className="expand-icon"
                                            style={{
                                                transform: expandedOrders[order.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />
                                    </button>
                                    <button
                                        className="btn-header-action btn-paid"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Don't toggle expansion when marking paid
                                            handleMarkPaid(order.id);
                                        }}
                                        title="Mark as Paid"
                                    >
                                        <Check size={24} strokeWidth={3} color="#ffffff" />
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
