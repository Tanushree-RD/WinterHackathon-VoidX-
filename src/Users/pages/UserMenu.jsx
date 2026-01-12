import { useAuth } from '../../shared/context/AuthContext';

export default function UserMenu() {
    const { user } = useAuth();

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>🍽️ User Menu Page</h1>
            <p>Welcome, {user?.displayName || user?.email}!</p>
            <p style={{ color: '#666', marginTop: '20px' }}>
                This is the Users Menu page. It will be built in the next steps.
            </p>
        </div>
    );
}
