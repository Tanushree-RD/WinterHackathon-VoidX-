import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getUserRole, isAuthorizedUser } from '../utils/authHelpers';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const userEmail = firebaseUser.email;

                // Check if user is authorized
                if (!isAuthorizedUser(userEmail)) {
                    setError('Unauthorized email. Please use your SJEC email address.');
                    firebaseSignOut(auth);
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                    return;
                }

                // Determine role
                const userRole = getUserRole(userEmail);

                setUser(firebaseUser);
                setRole(userRole);
                setError(null);
            } else {
                setUser(null);
                setRole(null);
                setError(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setRole(null);
            setError(null);
        } catch (err) {
            console.error('Sign out error:', err);
            setError(err.message);
        }
    };

    const value = {
        user,
        role,
        loading,
        error,
        signOut,
        isAuthenticated: !!user,
        isAdmin: role === 'admin',
        isUser: role === 'user'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
