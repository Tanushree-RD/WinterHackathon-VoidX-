import { db } from '../firebase/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const ORDERS_COLL = 'Orders';

export function subscribeToOrders(callback) {
    // Removed orderBy to avoid needing a complex composite index for 'in' queries
    const q = query(collection(db, ORDERS_COLL), where('status', 'in', ['cash', 'paid']));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory (asc by createdAt)
        orders.sort((a, b) => {
            const t1 = a.createdAt?.toMillis?.() || 0;
            const t2 = b.createdAt?.toMillis?.() || 0;
            return t1 - t2;
        });
        callback(orders);
    }, console.error);
}

export async function updateOrderStatus(orderId, status) {
    await updateDoc(doc(db, ORDERS_COLL, orderId), { status });
}

export async function createTestOrder() {
    // Random token between 1000 and 9999
    const token = Math.floor(1000 + Math.random() * 9000);

    await addDoc(collection(db, ORDERS_COLL), {
        items: [
            { itemId: 'test_id_1', name: 'Chicken Biryani', price: 250, quantity: 2 },
            { itemId: 'test_id_2', name: 'Coke', price: 40, quantity: 1 }
        ],
        totalPrice: 540,
        status: 'cash',
        token: token,
        paymentMode: 'cash',
        createdAt: serverTimestamp()
    });
}
