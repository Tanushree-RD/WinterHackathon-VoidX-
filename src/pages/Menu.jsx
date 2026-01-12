import { useState, useEffect, useMemo } from 'react';
import AddItemModal from '../components/AddItemModal';
import { getAllItems, addItem, deleteItem, updateItem } from '../utils/menuService';

export default function Menu() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    useEffect(() => { fetchItems(); }, []);
    const fetchItems = async () => {
        try { setItems(await getAllItems()); } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    const handleSave = async (data, file) => {
        try {
            if (editItem) await updateItem(editItem.id, editItem, data, file);
            else await addItem(data.name, data.price, data.tags, file);
            fetchItems();
        } catch (e) { alert("Error saving item"); }
    };
    const handleDelete = async (item) => {
        if (!confirm("Delete?")) return;
        await deleteItem(item.id, item.tags);
        setItems(items.filter(i => i.id !== item.id));
    };

    const itemsByTag = useMemo(() => {
        const g = {};
        items.forEach(i => i.tags.forEach(t => { if (!g[t]) g[t] = []; g[t].push(i); }));
        return g;
    }, [items]);

    return (
        <div>
            <h1>Menu Management</h1>
            {loading ? <p>Loading...</p> : Object.entries(itemsByTag).map(([tag, list]) => (
                <div key={tag}>
                    <h2>{tag}</h2>
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                        {list.map(item => (
                            <div key={item.id} style={{ minWidth: '200px', border: '1px solid #444', padding: '1rem', borderRadius: '8px' }}>
                                <strong>{item.name}</strong> - ₹{item.price}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <button onClick={() => { setEditItem(item); setIsModalOpen(true); }}>Edit</button>
                                    <button onClick={() => handleDelete(item)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button onClick={() => { setEditItem(null); setIsModalOpen(true); }} style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem', borderRadius: '50%' }}>+</button>
            <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleSave} initialData={editItem} />
        </div>
    );
}
