import { db } from '../firebase/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';

const ORDERS_COLL = 'Orders';

export function subscribeToOrders(callback) {
    // Reverted to Client-Side sorting to avoid "Missing Index" / Permission issues 
    // for the user. This is robust for small-to-medium datasets.
    const q = query(
        collection(db, ORDERS_COLL),
        where('status', 'in', ['cash', 'paid', 'pending'])
    );

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory (asc by createdAt)
        orders.sort((a, b) => {
            const t1 = a.createdAt?.toMillis?.() || 0;
            const t2 = b.createdAt?.toMillis?.() || 0;
            return t1 - t2;
        });
        callback(orders);
    }, (error) => {
        console.error("Firestore Query Error:", error);
    });
}

export async function updateOrderStatus(orderId, status) {
    await updateDoc(doc(db, ORDERS_COLL, orderId), { status });
}

export async function generateToken() {
    return await runTransaction(db, async (transaction) => {
        const tokenRef = doc(db, "Counters", "Tokens");
        const tokenDoc = await transaction.get(tokenRef);

        if (!tokenDoc.exists()) {
            // First time initialization
            transaction.set(tokenRef, { Current: 1 });
            return 1;
        }

        const newCurrent = (tokenDoc.data().Current || 0) + 1;
        transaction.update(tokenRef, { Current: newCurrent });

        return newCurrent;
    });
}

// Deprecated: createTestOrder was for initial testing
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
