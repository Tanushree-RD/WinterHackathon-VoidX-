import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useCart } from '../../shared/context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon } from 'lucide-react';

export default function UserLayout() {
    const { user, logout } = useAuth();
    const { getCartItemCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
            color: '#f8fafc',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header / Navbar */}
            <nav style={{
                padding: '1rem 2rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div
                    onClick={() => navigate('/users')}
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        letterSpacing: '-0.025em',
                        background: 'linear-gradient(to right, #60a5fa, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(96, 165, 250, 0.15)' }}>
                        🍔
                    </div>
                    QuikServ
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Cart Button */}
                    <button
                        onClick={() => navigate('/users/cart')}
                        style={{
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '0.6rem',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
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

            {/* Simple Mobile Navigation Placeholder */}
            {/* Will be used for Step 5: Fixed cart button */}
        </div>
    );
}
