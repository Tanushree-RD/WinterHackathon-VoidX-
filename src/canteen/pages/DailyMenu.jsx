import { useState, useEffect, useMemo } from 'react';
import './DailyMenu.css';
import {
    subscribeToItems,
    subscribeToDailyMenu,
    updateDailyMenu,
    subscribeToActiveMenu,
    setActiveMenuOverride
} from '../../shared/services/menuService';
import { Plus, Check, Calendar, Utensils, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Special'];

export default function DailyMenu() {
    // State
    const [selectedDay, setSelectedDay] = useState(() => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return DAYS.includes(today) ? today : 'Monday';
    });

    const [allItems, setAllItems] = useState([]);
    const [dayItemIds, setDayItemIds] = useState([]);
    const [activeMenuInfo, setActiveMenuInfo] = useState(null);

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Subscriptions
    useEffect(() => {
        // Fetch all items (database of items)
        const unsub = subscribeToItems((items) => setAllItems(items));
        return () => unsub();
    }, []);

    useEffect(() => {
        // Fetch specific day's menu
        const unsub = subscribeToDailyMenu(selectedDay, (ids) => setDayItemIds(ids));
        return () => unsub();
    }, [selectedDay]);

    useEffect(() => {
        // Fetch active menu info
        const unsub = subscribeToActiveMenu((info) => setActiveMenuInfo(info));
        return () => unsub();
    }, []);

    // Derived State
    const currentDayMenu = useMemo(() => {
        return dayItemIds.map(id => allItems.find(i => i.id === id)).filter(Boolean);
    }, [dayItemIds, allItems]);

    // Calculate which menu is ACTUALLY active for users right now
    const deployedMenuDay = useMemo(() => {
        const now = new Date();
        const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });

        if (activeMenuInfo && activeMenuInfo.current) {
            // Check override
            if (activeMenuInfo.overrideUntil) {
                const overrideTime = activeMenuInfo.overrideUntil.toDate ? activeMenuInfo.overrideUntil.toDate() : new Date(activeMenuInfo.overrideUntil);
                if (now <= overrideTime) {
                    return activeMenuInfo.current;
                }
            }
        }
        // Default to today
        return DAYS.includes(todayName) ? todayName : 'Monday'; // Default fallback
    }, [activeMenuInfo]);

    // Handlers
    const handleKeepAsMenu = async () => {
        if (confirm(`Set ${selectedDay} as the active menu for today?`)) {
            try {
                await setActiveMenuOverride(selectedDay);
                alert('Menu updated successfully!');
            } catch (error) {
                console.error(error);
                alert('Failed to update active menu.');
            }
        }
    };

    return (
        <div className="daily-menu-container">
            <div className="daily-header-row">
                <h2 className="daily-menu-header">Daily Menu</h2>
                <div className="active-status-badge">
                    <span className="dot" style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }}></span>
                    Live Now: {deployedMenuDay}
                </div>
            </div>

            {/* Top Section: Chips */}
            <div className="day-chips-container">
                {DAYS.map(day => (
                    <button
                        key={day}
                        className={`day-chip ${selectedDay === day ? 'active' : ''}`}
                        onClick={() => setSelectedDay(day)}
                    >
                        {day} {day === deployedMenuDay && <span style={{ marginLeft: 6, fontSize: '0.8em' }}>●</span>}
                    </button>
                ))}
            </div>

            {/* Middle Section: Items */}
            {currentDayMenu.length === 0 ? (
                <div className="empty-state">
                    <h3>No items for {selectedDay}</h3>
                    <p>Click "Add Items" to build the menu.</p>
                </div>
            ) : (
                <div className="menu-items-grid">
                    {currentDayMenu.map(item => (
                        <div key={item.id} className="menu-item-card">
                            <div className="item-img-box">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} />
                                ) : (
                                    <Utensils size={40} />
                                )}
                            </div>
                            <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                <div className="item-price">₹{item.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Section: Buttons */}
            <div className="bottom-actions-bar">
                <button className="action-btn btn-add" onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Add Items
                </button>
                <button className="action-btn btn-keep" onClick={handleKeepAsMenu}>
                    <Check size={18} /> Keep as Menu
                </button>
            </div>

            {/* Add Items Modal */}
            {isAddModalOpen && (
                <AddItemsModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    allItems={allItems}
                    initialSelectedIds={dayItemIds}
                    initialDay={selectedDay}
                    days={DAYS}
                    onSave={async (day, selectedIds) => {
                        await updateDailyMenu(day, selectedIds);
                        setIsAddModalOpen(false);
                        // If we saved to a different day, maybe switch view to that day?
                        // For now keep view or switch:
                        if (day !== selectedDay) setSelectedDay(day);
                    }}
                />
            )}
        </div>
    );
}

function AddItemsModal({ isOpen, onClose, allItems, initialSelectedIds, initialDay, days, onSave }) {
    const [targetDay, setTargetDay] = useState(initialDay);
    const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));

    // Refetch logic similar to previous implementation
    useEffect(() => {
        let active = true;
        const unsub = subscribeToDailyMenu(targetDay, (ids) => {
            if (active) setSelectedIds(new Set(ids));
        });
        return () => { active = false; unsub(); };
    }, [targetDay]);

    const toggleItem = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Select Menu</h3>
                    <button onClick={onClose} className="btn-close-modal"><X size={20} /></button>
                </div>

                <div className="modal-select-container">
                    <label className="modal-label">Select Menu Day</label>
                    <select
                        value={targetDay}
                        onChange={e => setTargetDay(e.target.value)}
                        className="modal-select"
                    >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="modal-list">
                    {allItems.map(item => (
                        <div
                            key={item.id}
                            className={`modal-item-row ${selectedIds.has(item.id) ? 'selected' : ''}`}
                            onClick={() => toggleItem(item.id)}
                        >
                            <div>
                                <div className="modal-item-name">{item.name}</div>
                                <div className="modal-item-price">₹{item.price}</div>
                            </div>
                            <div className="checkbox-custom">
                                {selectedIds.has(item.id) && <Check size={16} color="white" />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="action-btn btn-add" onClick={() => onSave(targetDay, Array.from(selectedIds))}>Confirm</button>
                </div>
            </div>
        </div>
    );
}
