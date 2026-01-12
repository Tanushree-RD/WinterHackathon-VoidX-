import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useCart } from '../../shared/context/CartContext';
import { LogOut, ShoppingCart, User, History, UtensilsCrossed } from 'lucide-react';

export default function UserLayout() {
    const { logout, user } = useAuth();
    const { getCartItemCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Navbar */}
            <nav style={{
                padding: '1rem 1.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <Link to="/users/menu" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                        <UtensilsCrossed size={22} color="white" />
                    </div>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: '#fff',
                        letterSpacing: '-0.025em'
                    }}>VoidX <span style={{ color: '#3b82f6' }}>Canteen</span></span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* My Orders Link */}
                    <button
                        onClick={() => navigate('/users/orders')}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '0.6rem 1rem',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >
                        <History size={18} />
                        <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>Orders</span>
                    </button>

                    {/* Cart Tooltip Button */}
                    <button
                        onClick={() => navigate('/users/cart')}
                        style={{
                            position: 'relative',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '0.75rem',
                            padding: '0.6rem',
                            color: '#60a5fa',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        }}
                    >
                        <ShoppingCart size={22} />
                        {getCartItemCount() > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-0.4rem',
                                right: '-0.4rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                borderRadius: '9999px',
                                minWidth: '1.25rem',
                                height: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #0f172a',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {getCartItemCount()}
                            </span>
                        )}
                    </button>

                    {/* Profile & Logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
}
