import { useState, useEffect } from 'react';
import { subscribeToOrders, updateOrderStatus, createTestOrder } from '../../shared/services/orderService';
import { Clock, IndianRupee } from 'lucide-react';
import './Orders.css';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToOrders((newOrders) => {
            setOrders(newOrders);
            setLoading(false);
        });
        return () => unsub && unsub();
    }, []);

    const [undoData, setUndoData] = useState(null);

    // Filtered lists
    const cashOrders = orders.filter(o => o.status === 'cash');
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
                    <button onClick={createTestOrder} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#444' }}>+ Test</button>
                </div>
                <div className="orders-list">
                    {cashOrders.length === 0 && <div className="no-orders">No pending cash orders</div>}
                    {cashOrders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <span className="order-token">Token #{order.token}</span>
                                <span className="order-time"><Clock size={12} style={{ marginRight: 4 }} />{formatTime(order.createdAt)}</span>
                            </div>
                            <div className="order-items">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                        <span><span className="item-qty">{item.quantity}x</span> {item.name}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <span className="total-label">Total Amount</span>
                                <span className="total-amount">₹{order.totalPrice}</span>
                            </div>
                            <div className="order-actions">
                                <button className="btn-action btn-mark-paid" onClick={() => handleMarkPaid(order.id)}>
                                    Mark as Paid
                                </button>
                            </div>
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
                    {paidOrders.length === 0 && <div className="no-orders" style={{ color: '#555' }}>No paid orders yet</div>}
                    {paidOrders.map(order => (
                        <div key={order.id} className="order-card" style={{ borderColor: '#2e7d32' }}>
                            <div className="order-card-header">
                                <span className="order-token">Token #{order.token}</span>
                                <span className="order-time">{formatTime(order.createdAt)}</span>
                            </div>
                            <div className="order-items">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                        <span><span className="item-qty">{item.quantity}x</span> {item.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <span className="total-label" style={{ color: '#4caf50' }}>PAID via {order.paymentMode}</span>
                                <span className="total-amount">₹{order.totalPrice}</span>
                            </div>
                            <div className="order-actions">
                                <button className="btn-action btn-picked" onClick={() => handlePicked(order.id)}>
                                    Order Picked
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
