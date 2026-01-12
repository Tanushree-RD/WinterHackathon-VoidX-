import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const MenuContext = createContext();

export function useMenu() {
    return useContext(MenuContext);
}

export function MenuProvider({ children }) {
    const [activeMenuInfo, setActiveMenuInfo] = useState(null);
    const [todayItemIds, setTodayItemIds] = useState([]);
    const [todayItems, setTodayItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const getTodayDayName = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    };

    // Listen to Menu/active
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "Menu", "active"), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setActiveMenuInfo(docSnapshot.data());
            } else {
                setActiveMenuInfo(null);
            }
        }, (error) => {
            console.error("Error fetching active menu info:", error);
            setActiveMenuInfo(null);
        });

        return () => unsubscribe();
    }, []);

    // Determine target menu and listen to it
    useEffect(() => {
        let targetMenu = getTodayDayName();
        const now = new Date();

        if (activeMenuInfo && activeMenuInfo.current) {
            let isOverrideValid = false;
            if (activeMenuInfo.overrideUntil) {
                const overrideTime = activeMenuInfo.overrideUntil.toDate ? activeMenuInfo.overrideUntil.toDate() : new Date(activeMenuInfo.overrideUntil);
                if (now <= overrideTime) {
                    isOverrideValid = true;
                }
            }

            if (isOverrideValid) {
                targetMenu = activeMenuInfo.current;
            }
        }

        setLoading(true);
        const unsubscribe = onSnapshot(doc(db, "Menu", targetMenu), (docSnapshot) => {
            if (docSnapshot.exists()) {
                setTodayItemIds(docSnapshot.data().itemIds || []);
            } else {
                setTodayItemIds([]);
            }
        }, (error) => {
            console.error(`Error fetching menu for ${targetMenu}:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [activeMenuInfo]);

    // Step 3: Resolve Item IDs to full documents
    useEffect(() => {
        if (todayItemIds.length === 0) {
            setTodayItems([]);
            if (!loading) setLoading(false);
            return;
        }

        const fetchItems = async () => {
            try {
                // Firestore 'in' query is limited to 10-30 IDs depending on version, 
                // but usually the daily menu is small.
                const itemsRef = collection(db, "Items");
                const q = query(itemsRef, where(documentId(), 'in', todayItemIds));

                // We use getDocs for a one-time fetch or onSnapshot for real-time item updates
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const items = [];
                    querySnapshot.forEach((doc) => {
                        items.push({ id: doc.id, ...doc.data() });
                    });

                    // Sort items based on the original ID order from the menu
                    const sortedItems = todayItemIds
                        .map(id => items.find(item => item.id === id))
                        .filter(Boolean);

                    setTodayItems(sortedItems);
                    setLoading(false);
                });

                return unsubscribe;
            } catch (error) {
                console.error("Error resolving menu items:", error);
                setLoading(false);
            }
        };

        let unsubscribe;
        fetchItems().then(unsub => unsubscribe = unsub);

        return () => unsubscribe && unsubscribe();
    }, [todayItemIds]);

    const value = {
        activeMenuName: activeMenuInfo?.current || getTodayDayName(),
        todayItems,
        loading
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
}
