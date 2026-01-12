import { Outlet, Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../shared/firebase/firebase';
import './Layout.css';

export default function Layout() {
    const location = useLocation();
    const handleLogout = () => signOut(auth);

    return (
        <div className="layout-container">
            <nav className="navbar">
                <div className="brand">Staff Dashboard</div>
                <div className="nav-links">
                    <Link
                        to="/canteen/menu"
                        className={`nav-btn ${location.pathname === '/canteen/menu' ? 'active' : ''}`}
                    >
                        Menu
                    </Link>
                    <Link
                        to="/canteen/orders"
                        className={`nav-btn ${location.pathname === '/canteen/orders' ? 'active' : ''}`}
                    >
                        Orders
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
