import { useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useMenu } from '../../shared/context/MenuContext';
import { useCart } from '../../shared/context/CartContext';
import { Info, ShoppingBag, Plus, Minus, Check, Trash2, Search, Loader2 } from 'lucide-react';
import './UserMenu.css';

export default function UserMenu() {
    const { user } = useAuth();
    const { activeMenuName, todayItems, loading: menuLoading } = useMenu();
    const { cart, isInitialized: cartInitialized, addToCart, removeFromCart } = useCart();

    // Local state for quantity selection
    const [selectingItemId, setSelectingItemId] = useState(null);
    const [tempQuantity, setTempQuantity] = useState(1);

    // Search State
    const [searchText, setSearchText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // Group items by tags - an item can appear in multiple tag sections
    const groupedItems = todayItems.reduce((acc, item) => {
        const itemTags = (item.tags && item.tags.length > 0) ? item.tags : ['Other'];
        itemTags.forEach(tag => {
            if (!acc[tag]) acc[tag] = [];
            acc[tag].push(item);
        });
        return acc;
    }, {});

    if (menuLoading || !cartInitialized) {
        return (
            <div className="loader-container">
                <div className="loader" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(96, 165, 250, 0.2)',
                    borderTopColor: '#60a5fa',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <div className="loader-text">Preparing today's delights...</div>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    const handleAddClick = (itemId) => {
        setSelectingItemId(itemId);
        setTempQuantity(1);
    };

    const handleCancel = () => {
        setSelectingItemId(null);
        setTempQuantity(1);
    };

    const handleConfirm = (item) => {
        addToCart(item.id, tempQuantity, {
            name: item.name,
            price: item.price,
            image: item.image || item.imageUrl
        });
        setSelectingItemId(null);
        setTempQuantity(1);
    };

    const handleDelete = (itemId) => {
        removeFromCart(itemId);
    };

    const incrementQuantity = () => {
        setTempQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (tempQuantity > 1) {
            setTempQuantity(prev => prev - 1);
        }
    };

    const smartSearch = async () => {
        if (!searchText.trim()) return;

        setIsSearching(true);
        setShowResults(true);
        setSearchResults([]);

        try {
            const response = await fetch('http://localhost:3000/smart-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: searchText,
                    menu: todayItems
                }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Smart search failed, falling back to local filter:", error);

            let query = searchText.toLowerCase().trim();
            // Step 1: Normalize common phrases
            query = query.replace(/\bnon\s+veg\b/g, 'non-veg');
            query = query.replace(/\bnon\s+vegetarian\b/g, 'non-veg');

            const words = query.split(/\s+/).filter(w => w.length > 0);

            if (words.length === 0) {
                setSearchResults([]);
                return;
            }

            // Intent detectors
            const isNonVeg = words.some(w => ['non-veg', 'nonveg', 'nv', 'meat', 'chicken', 'egg', 'fish', 'mutton'].includes(w));
            // Only flag as Veg if Non-Veg wasn't detected (to handle "non veg" properly)
            const isVeg = !isNonVeg && words.some(w => ['veg', 'vegetarian', 'v'].includes(w));
            const isCheap = words.some(w => ['cheap', 'budget', 'under', 'affordable', 'low', 'price', 'below', 'less'].includes(w));

            // Price threshold
            let priceLimit = Infinity;
            const priceMatch = query.match(/(?:under|below|rs\.?|₹|max|less\s+than)\s*(\d+)/i);
            if (priceMatch) {
                priceLimit = parseInt(priceMatch[1]);
            } else if (isCheap) {
                const prices = todayItems.map(i => i.price).sort((a, b) => a - b);
                priceLimit = prices[Math.floor(prices.length * 0.45)] || 100;
            }

            const intentWords = ['cheap', 'veg', 'non-veg', 'nonveg', 'under', 'budget', 'items', 'food', 'vegetarian', 'affordable', 'low', 'price', 'rs', 'below', 'max', 'v', 'nv', 'non', 'less', 'than'];
            const searchKeywords = words.filter(w => !intentWords.includes(w));

            const scoredResults = todayItems.map(item => {
                const itemName = item.name.toLowerCase();
                const itemTags = (item.tags || []).map(t => t.toLowerCase());
                let score = 0;

                // 1. Dietary logic
                const itemIsVeg = itemTags.includes('veg');
                const itemIsNonVeg = itemTags.includes('non-veg') || itemTags.includes('chicken') || itemName.includes('chicken') || itemTags.includes('meat');

                // Filter logic
                if (isVeg && !itemIsVeg) return null;
                if (isNonVeg && !itemIsNonVeg) return null;

                // 2. Price filter
                if (item.price > priceLimit) return null;

                // 3. Keyword Scoring (Check both separate words and the full phrase)
                if (searchKeywords.length > 0) {
                    searchKeywords.forEach(kw => {
                        if (itemName.includes(kw)) {
                            score += 10;
                            if (itemName.startsWith(kw)) score += 5;
                        }
                        if (itemTags.some(t => t.includes(kw))) score += 5;
                    });

                    // If user searched for a specific name but it doesn't match, drop it
                    if (score === 0) return null;
                } else if (isVeg || isNonVeg || isCheap) {
                    // If no specific keyword, base score for matching category
                    score = 1;
                } else {
                    // No keywords and no intent found (shouldn't happen with filtered logic)
                    return null;
                }

                // 4. Price scoring (Tie-breaker for "cheap")
                if (isCheap) {
                    // Lower price gives higher score boost
                    score += (1000 / (item.price || 1));
                }

                return { ...item, _score: score };
            }).filter(Boolean);

            // Sort by score (descending)
            const fallbackResults = scoredResults.sort((a, b) => b._score - a._score);

            setSearchResults(fallbackResults);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="user-menu-container">
            {/* Hero Section */}
            <div className="menu-hero">
                <h1 className="hero-greeting">
                    Ahoj, {user?.displayName?.split(' ')[0] || 'Friend'}! 👋
                </h1>
                <p className="hero-subtitle">
                    Explore today's specific {activeMenuName} menu.
                </p>

                {/* Smart Search Input */}
                <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search food like 'cheap veg snack'"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && smartSearch()}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '1rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#0f172a',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                    <button
                        onClick={smartSearch}
                        disabled={isSearching || !searchText.trim()}
                        style={{
                            padding: '0 1.5rem',
                            borderRadius: '1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: (isSearching || !searchText.trim()) ? 0.7 : 1
                        }}
                    >
                        {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                    <style>{`
                        .animate-spin { animation: spin 1s linear infinite; }
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </div>

            {/* Search Results Section */}
            {showResults && (
                <div style={{ marginBottom: '4rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                            Results for: "{searchText}"
                        </h2>
                        <button
                            onClick={() => { setShowResults(false); setSearchText(''); setSearchResults([]); }}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            Clear Results
                        </button>
                    </div>

                    {searchResults.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '1.5rem' }}>
                            <p style={{ color: '#94a3b8' }}>No items match your search.</p>
                        </div>
                    ) : (
                        <div className="menu-grid">
                            {searchResults.map((item) => {
                                const isInCart = cart[item.id];
                                const isSelecting = selectingItemId === item.id;

                                return (
                                    <div key={item.id} className="menu-item-card" style={{ border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                        {/* Image */}
                                        <div className="item-image-container">
                                            {item.image || item.imageUrl ? (
                                                <img src={item.image || item.imageUrl} alt={item.name} className="item-image" />
                                            ) : (
                                                <div className="image-placeholder"><ShoppingBag size={48} /></div>
                                            )}
                                            <div className="image-overlay"></div>
                                        </div>

                                        <div className="card-content">
                                            <h3 className="item-name">{item.name}</h3>
                                            <div className="item-footer">
                                                <div className="item-price">₹{item.price}</div>
                                                {!isInCart && !isSelecting && (
                                                    <button onClick={() => handleAddClick(item.id)} className="btn-add">Add</button>
                                                )}
                                                {isSelecting && (
                                                    <div className="qty-selector">
                                                        <button onClick={decrementQuantity} className="btn-qty minus"><Minus size={16} strokeWidth={2.5} /></button>
                                                        <span className="qty-display">{tempQuantity}</span>
                                                        <button onClick={incrementQuantity} className="btn-qty plus"><Plus size={16} strokeWidth={2.5} /></button>
                                                    </div>
                                                )}
                                                {isInCart && !isSelecting && (
                                                    <div className="added-status">
                                                        <div className="status-badge"><Check size={16} strokeWidth={2.5} />Added</div>
                                                        <button onClick={() => handleDelete(item.id)} className="btn-delete"><Trash2 size={18} strokeWidth={2.5} /></button>
                                                    </div>
                                                )}
                                            </div>
                                            {isSelecting && (
                                                <div className="selection-actions">
                                                    <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                                                    <button onClick={() => handleConfirm(item)} className="btn-confirm">Confirm</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', marginTop: '3rem' }}></div>
                </div>
            )}

            {/* Menu Sections by Tag */}
            {todayItems.length === 0 ? (
                <div className="empty-menu">
                    <Info size={48} className="empty-icon" />
                    <h3 className="empty-title">No items available right now</h3>
                    <p>The canteen kitchen is preparing the menu. Check back in a moment!</p>
                </div>
            ) : (
                Object.entries(groupedItems)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([tag, items]) => (
                        <div key={tag} className="tag-section">
                            {/* Tag Header */}
                            <div className="tag-header">
                                <div className="tag-title-wrapper">
                                    <div className="tag-accent-bar"></div>
                                    <h2 className="tag-title">{tag}</h2>
                                </div>
                                <div className="tag-divider"></div>
                            </div>

                            <div className="menu-grid">
                                {items.map((item) => {
                                    const isInCart = cart[item.id];
                                    const isSelecting = selectingItemId === item.id;

                                    return (
                                        <div key={`${tag}-${item.id}`} className="menu-item-card">
                                            {/* Image */}
                                            <div className="item-image-container">
                                                {item.image || item.imageUrl ? (
                                                    <img
                                                        src={item.image || item.imageUrl}
                                                        alt={item.name}
                                                        className="item-image"
                                                    />
                                                ) : (
                                                    <div className="image-placeholder">
                                                        <ShoppingBag size={48} />
                                                    </div>
                                                )}
                                                <div className="image-overlay"></div>
                                            </div>

                                            <div className="card-content">
                                                <h3 className="item-name">{item.name}</h3>

                                                <div className="item-footer">
                                                    <div className="item-price">
                                                        ₹{item.price}
                                                    </div>

                                                    {/* STATE A: Default - Add Button */}
                                                    {!isInCart && !isSelecting && (
                                                        <button
                                                            onClick={() => handleAddClick(item.id)}
                                                            className="btn-add"
                                                        >
                                                            Add
                                                        </button>
                                                    )}

                                                    {/* STATE B: Selecting - Quantity Picker */}
                                                    {isSelecting && (
                                                        <div className="qty-selector">
                                                            <button
                                                                onClick={decrementQuantity}
                                                                className="btn-qty minus"
                                                            >
                                                                <Minus size={16} strokeWidth={2.5} />
                                                            </button>
                                                            <span className="qty-display">
                                                                {tempQuantity}
                                                            </span>
                                                            <button
                                                                onClick={incrementQuantity}
                                                                className="btn-qty plus"
                                                            >
                                                                <Plus size={16} strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* STATE C: Added - Delete Icon */}
                                                    {isInCart && !isSelecting && (
                                                        <div className="added-status">
                                                            <div className="status-badge">
                                                                <Check size={16} strokeWidth={2.5} />
                                                                Added
                                                            </div>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="btn-delete"
                                                            >
                                                                <Trash2 size={18} strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selecting State Actions */}
                                                {isSelecting && (
                                                    <div className="selection-actions">
                                                        <button onClick={handleCancel} className="btn-cancel">
                                                            Cancel
                                                        </button>
                                                        <button onClick={() => handleConfirm(item)} className="btn-confirm">
                                                            Confirm
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
            )}

            {/* Step Status */}
            <div style={{
                marginTop: '6rem', padding: '2rem', borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', opacity: 0.5
            }}>
                CART PERSISTENCE ACTIVE • MENU RESOLVED ({todayItems.length}) • STEP 4 COMPLETE
            </div>
        </div>
    );
}
