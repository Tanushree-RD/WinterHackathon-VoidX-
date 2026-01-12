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
                    <span className="dot" style={{ width: 8, height: 8, background: '#34d399', borderRadius: '50%' }}></span>
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

    // If target day changes, we should ideally fetch that day's items to show check state,
    // BUT the requirement says "Default selected value = currently active chip" and "Previously selected items remain checked" (when reopened).
    // It implies if I switch dropdown in modal, I should probably load that day's items?
    // The prompt says: "When reopened: Previously selected items remain checked".
    // It doesn't explicitly say "When switching dropdown in modal, load that day's items".
    // But "Menu Selector" is inside the dialog.
    // If I change the dropdown, logic dictates I should probably edit THAT day's menu.
    // So I need to fetch the IDs for `targetDay` whenever it changes.
    // Since I can't easily subscribe inside a sub-component conditionally without complexity, 
    // I might just accept that for this V1, changing the dropdown might require fetching.

    // However, the simplest interpretation is: 
    // 1. Open modal for "Monday".
    // 2. Select items.
    // 3. Confirm -> Saves to Monday.

    // If user changes dropdown to "Tuesday", it implies they want to save THIS selection to Tuesday? 
    // Or they want to EDIT Tuesday?
    // "Fetch all items... Display as vertical list... Checkbox... Previously selected items remain checked".
    // This usually implies "Edit mode for existing items of that day".

    // So I will make a quick fetch when targetDay changes.
    useEffect(() => {
        let active = true;
        // We need a one-off fetch here because we are inside a modal and switching days
        // reusing the subscription logic might be tricky if not lifted up.
        // I will use a direct subscription for the modal's target day or just a one-off get?
        // Prompt says "When KEYBOARD... Previously selected items remain checked".
        // It refers to when the DIALOG is REOPENED.

        // Let's implement: When Target Day changes, we fetch its current items to populate the checkboxes.
        // We can use the same subscribeToDailyMenu but we need to Unsubscribe old one.

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="modal-title">Select Menu</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Select Menu Day</label>
                    <select
                        value={targetDay}
                        onChange={e => setTargetDay(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            background: '#151520',
                            color: 'white',
                            border: '1px solid #444',
                            borderRadius: '8px'
                        }}
                    >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="modal-list">
                    {allItems.map(item => (
                        <div key={item.id} className="modal-item-row" onClick={() => toggleItem(item.id)}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                <div style={{ fontSize: '0.9rem', color: '#34d399' }}>₹{item.price}</div>
                            </div>
                            <div style={{
                                width: 24, height: 24,
                                borderRadius: 6,
                                border: '2px solid #555',
                                background: selectedIds.has(item.id) ? '#00d4ff' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {selectedIds.has(item.id) && <Check size={16} color="white" />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button className="action-btn" style={{ background: 'transparent', border: '1px solid #555' }} onClick={onClose}>Cancel</button>
                    <button className="action-btn btn-add" onClick={() => onSave(targetDay, Array.from(selectedIds))}>Confirm</button>
                </div>
            </div>
        </div>
    );
}
