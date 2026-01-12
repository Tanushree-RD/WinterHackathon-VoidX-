import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Utensils } from 'lucide-react';
import './Menu.css';
import AddItemModal from '../components/AddItemModal';
import { subscribeToItems, deleteItem } from '../utils/menuService';

export default function Menu() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToItems((updatedItems) => {
            setItems(updatedItems);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (item) => {
        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
            await deleteItem(item.id, item.tags || []);
        }
    };

    // Group items by their tags
    // Since an item can have multiple tags, it will appear in multiple sections
    const itemsByTag = {};
    items.forEach(item => {
        if (item.tags && item.tags.length > 0) {
            item.tags.forEach(tag => {
                if (!itemsByTag[tag]) itemsByTag[tag] = [];
                itemsByTag[tag].push(item);
            });
        } else {
            // Fallback for no tags
            if (!itemsByTag['Uncategorized']) itemsByTag['Uncategorized'] = [];
            itemsByTag['Uncategorized'].push(item);
        }
    });

    const categories = Object.keys(itemsByTag).sort();

    return (
        <div className="menu-container">
            <h2 className="menu-header">Menu Management</h2>

            <button className="add-item-btn" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} /> Add New Item
            </button>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading menu...</div>
            ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: '#777' }}>
                    <p>No items found. Click the button below to add one.</p>
                </div>
            ) : (
                <div className="menu-scroll-container">
                    {categories.map(category => (
                        <div key={category} className="category-section">
                            <h3 className="category-title">{category}</h3>
                            <div className="items-horizontal-scroll">
                                {itemsByTag[category].map(item => (
                                    <div key={`${category}-${item.id}`} className="menu-card">
                                        <div className="card-image-placeholder">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Utensils size={40} />
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <h4 className="card-title">{item.name}</h4>
                                            <p className="card-price">₹{item.price}</p>
                                        </div>
                                        <div className="card-actions">
                                            <Edit2 size={16} className="action-icon" />
                                            <Trash2 size={16} className="action-icon" onClick={() => handleDelete(item)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}
