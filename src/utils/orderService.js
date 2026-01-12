import { db } from '../firebase/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const ORDERS_COLL = 'Orders';

export function subscribeToOrders(callback) {
    const q = query(collection(db, ORDERS_COLL), where('status', 'in', ['cash', 'paid']), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, console.error);
}

export async function updateOrderStatus(orderId, status) {
    await updateDoc(doc(db, ORDERS_COLL, orderId), { status });
}

export async function createTestOrder() {
    await addDoc(collection(db, ORDERS_COLL), {
        items: [{ itemId: '1', name: 'Burger', price: 50, quantity: 1 }],
        totalPrice: 50, status: 'cash', token: Math.floor(Math.random() * 1000), paymentMode: 'cash', createdAt: serverTimestamp()
    });
}
