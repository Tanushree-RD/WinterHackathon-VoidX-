import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

/**
 * Protected route wrapper that requires authentication and specific role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {'admin' | 'user'} props.requiredRole - Required role to access route
 */
export default function RoleProtectedRoute({ children, requiredRole }) {
    const { user, role, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <Loading />;
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to appropriate dashboard if role doesn't match
    if (role !== requiredRole) {
        const redirectPath = role === 'admin' ? '/admin/menu' : '/users/menu';
        return <Navigate to={redirectPath} replace />;
    }

    // User is authenticated and has correct role
    return children;
}
