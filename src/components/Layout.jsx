import { Outlet, Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export default function Layout() {
    const location = useLocation();
    const handleLogout = () => signOut(auth);

    const navLinkStyle = (path) => ({
        textDecoration: 'none',
        color: location.pathname === path ? '#646cff' : '#e0e0e0',
        fontWeight: location.pathname === path ? 'bold' : 'normal',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        backgroundColor: location.pathname === path ? 'rgba(100, 108, 255, 0.1)' : 'transparent',
        transition: 'all 0.2s'
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #444', backgroundColor: '#1a1a1a' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>🔥 Canteen Studio</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/menu" style={navLinkStyle('/menu')}>Menu</Link>
                    <Link to="/orders" style={navLinkStyle('/orders')}>Orders</Link>
                    <button onClick={handleLogout} style={{ marginLeft: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem', backgroundColor: '#d32f2f' }}>Logout</button>
                </div>
            </nav>
            <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                <Outlet />
            </main>
        </div>
    );
}
