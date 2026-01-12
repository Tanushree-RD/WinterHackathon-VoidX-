import { Outlet, Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
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
                        to="/menu"
                        className={`nav-btn ${location.pathname === '/menu' ? 'active' : ''}`}
                    >
                        Menu
                    </Link>
                    <Link
                        to="/orders"
                        className={`nav-btn ${location.pathname === '/orders' ? 'active' : ''}`}
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
