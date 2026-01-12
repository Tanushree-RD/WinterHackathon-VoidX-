import { db, storage } from '../firebase/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, arrayUnion, arrayRemove, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ITEMS_COLL = 'Items';
const TAGS_COLL = 'Tags';

export function subscribeToItems(callback) {
    const q = collection(db, ITEMS_COLL);
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
    }, (error) => {
        console.error("Error fetching items:", error);
    });
}

export async function addItem(name, price, tags, imageFile) {
    try {
        const itemId = doc(collection(db, ITEMS_COLL)).id;
        let imageUrl = '';
        if (imageFile) {
            const storageRef = ref(storage, `menu-items/${itemId}`);
            await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(storageRef);
        }
        const itemData = { name, price: Number(price), tags, imageUrl, createdAt: serverTimestamp() };
        await setDoc(doc(db, ITEMS_COLL, itemId), itemData);

        for (const tag of tags) {
            const tagRef = doc(db, TAGS_COLL, tag);
            const tagSnap = await getDoc(tagRef);
            if (!tagSnap.exists()) await setDoc(tagRef, { itemIds: [itemId] });
            else await updateDoc(tagRef, { itemIds: arrayUnion(itemId) });
        }
        return itemId;
    } catch (error) { console.error(error); throw error; }
}

export async function updateItem(itemId, oldData, newData, imageFile) {
    let imageUrl = oldData.imageUrl;
    if (imageFile) {
        const storageRef = ref(storage, `menu-items/${itemId}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
    }

    const price = Number(newData.price);
    await updateDoc(doc(db, ITEMS_COLL, itemId), {
        name: newData.name,
        price,
        tags: newData.tags,
        imageUrl
    });

    // Tag Synchronization
    const oldTags = oldData.tags || [];
    const newTags = newData.tags || [];

    // Tags to remove item from
    const removedTags = oldTags.filter(t => !newTags.includes(t));
    for (const tag of removedTags) {
        // We use arrayRemove which is safe even if doc doesn't exist, 
        // but we assume tag docs exist if they were in the item previously.
        // It's safer to check existence or just try update.
        // If a tag doc is empty afterwards, we could delete it, but keeping it is fine.
        const tagRef = doc(db, TAGS_COLL, tag);
        try {
            await updateDoc(tagRef, { itemIds: arrayRemove(itemId) });
        } catch (e) {
            console.log(`Error removing from tag ${tag}`, e);
        }
    }

    // Tags to add item to
    const addedTags = newTags.filter(t => !oldTags.includes(t));
    for (const tag of addedTags) {
        const tagRef = doc(db, TAGS_COLL, tag);
        const tagSnap = await getDoc(tagRef);
        if (!tagSnap.exists()) {
            await setDoc(tagRef, { itemIds: [itemId] });
        } else {
            await updateDoc(tagRef, { itemIds: arrayUnion(itemId) });
        }
    }
}

export async function deleteItem(itemId, tags) {
    await deleteDoc(doc(db, ITEMS_COLL, itemId));
    for (const tag of tags) {
        await updateDoc(doc(db, TAGS_COLL, tag), { itemIds: arrayRemove(itemId) });
    }
}

const MENU_COLL = 'Menu';

export function subscribeToDailyMenu(day, callback) {
    return onSnapshot(doc(db, MENU_COLL, day), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().itemIds || []);
        } else {
            callback([]);
        }
    });
}

export async function updateDailyMenu(day, itemIds) {
    const docRef = doc(db, MENU_COLL, day);
    // Using merge: true to avoid overwriting other fields if any, though we only store itemIds for now
    await setDoc(docRef, { itemIds }, { merge: true });
}

export function subscribeToActiveMenu(callback) {
    return onSnapshot(doc(db, MENU_COLL, 'active'), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            callback(null);
        }
    });
}

export async function setActiveMenuOverride(day) {
    // Override until today 23:59:59
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    await setDoc(doc(db, MENU_COLL, 'active'), {
        current: day,
        overrideUntil: now // Firestore helper might be needed if strictly timestamp, but Date usually works
    });
}
