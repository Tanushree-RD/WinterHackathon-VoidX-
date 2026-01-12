import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Loading from '../components/Loading';

export default function RoleBasedRoute({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role || 'canteen'); // Default to canteen for backward compatibility
                    } else {
                        // If no user doc exists, assume canteen role (for existing users)
                        setRole('canteen');
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setRole('canteen'); // Fallback to canteen
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <Loading />;

    // Not logged in - redirect to login
    if (!user) return <Navigate to="/login" replace />;

    // Logged in - redirect based on role
    if (role === 'canteen') {
        return <Navigate to="/canteen/menu" replace />;
    } else if (role === 'client') {
        return <Navigate to="/client/home" replace />;
    }

    // Fallback
    return <Navigate to="/login" replace />;
}
