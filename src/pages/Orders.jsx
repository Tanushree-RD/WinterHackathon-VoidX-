import { useState, useEffect } from 'react';
import { subscribeToOrders, updateOrderStatus, createTestOrder } from '../utils/orderService';

export default function Orders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const unsub = subscribeToOrders(setOrders);
        return () => unsub && unsub();
    }, []);

    const moveOrder = (id, status) => updateOrderStatus(id, status);

    return (
        <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
                <h2>Cash ({orders.filter(o => o.status === 'cash').length})</h2>
                <button onClick={createTestOrder}>+ Test Order</button>
                {orders.filter(o => o.status === 'cash').map(o => (
                    <div key={o.id} style={{ border: '1px solid #555', padding: '1rem', margin: '0.5rem 0' }}>
                        <strong>#{o.token}</strong> - ₹{o.totalPrice}
                        <button onClick={() => moveOrder(o.id, 'paid')}>Mark Paid</button>
                    </div>
                ))}
            </div>
            <div style={{ flex: 1 }}>
                <h2>Paid ({orders.filter(o => o.status === 'paid').length})</h2>
                {orders.filter(o => o.status === 'paid').map(o => (
                    <div key={o.id} style={{ border: '1px solid #555', padding: '1rem', margin: '0.5rem 0' }}>
                        <strong>#{o.token}</strong>
                        <button onClick={() => moveOrder(o.id, 'picked')}>Picked</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
