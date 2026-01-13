import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useCart } from '../../shared/context/CartContext';
import { LogOut, ShoppingCart, UtensilsCrossed, History } from 'lucide-react';
import './UserLayout.css';

export default function UserLayout() {
    const { signOut } = useAuth();
    const { getCartItemCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    return (
        <div className="user-layout-container">
            {/* Header / Navbar */}
            <nav className="user-navbar">
                <Link to="/users/menu" className="nav-brand-link">
                    <div className="brand-icon-wrapper">
                        <UtensilsCrossed size={22} color="white" />
                    </div>
                    <span className="brand-text">VoidX <span className="brand-text-highlight">Canteen</span></span>
                </Link>

                <div className="nav-actions">
                    {/* Cart Tooltip Button */}
                    <button
                        onClick={() => navigate('/users/cart')}
                        className="icon-btn btn-cart"
                        title="My Cart"
                    >
                        <ShoppingCart size={22} />
                        {getCartItemCount() > 0 && (
                            <span className="cart-badge">
                                {getCartItemCount()}
                            </span>
                        )}
                    </button>

                    {/* My Orders Link */}
                    <button
                        onClick={() => navigate('/users/orders')}
                        className="icon-btn btn-orders"
                        title="My Orders"
                    >
                        <History size={22} />
                    </button>

                    {/* Profile & Logout */}
                    <div className="logout-wrapper">
                        <button
                            onClick={handleLogout}
                            className="btn-logout"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
