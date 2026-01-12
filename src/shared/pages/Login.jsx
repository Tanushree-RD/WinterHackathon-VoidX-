import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../shared/firebase/firebase';
import { useAuth } from '../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getRedirectPath } from '../../shared/utils/authHelpers';
import './Login.css';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, role } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (user && role) {
            const redirectPath = getRedirectPath(role);
            navigate(redirectPath, { replace: true });
        }
    }, [user, role, navigate]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await signInWithPopup(auth, provider);
            const userEmail = result.user.email;

            // AuthContext will handle role validation and routing
            console.log('Signed in:', userEmail);

        } catch (err) {
            console.error('Sign in error:', err);

            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled. Please try again.');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized. Please contact admin.');
            } else {
                setError('Failed to sign in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-container">
                        <div className="logo-icon">🍽️</div>
                        <h1 className="app-title">QuikServ</h1>
                    </div>
                    <p className="app-subtitle">College Canteen Food Ordering</p>
                </div>

                <div className="login-content">
                    <h2 className="welcome-text">Welcome Back!</h2>
                    <p className="login-description">
                        Sign in with your SJEC email to continue
                    </p>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="google-signin-btn"
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <svg className="google-icon" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <div className="login-info">
                        <div className="info-item">
                            <span className="info-icon">👨‍🎓</span>
                            <span>Students: Use @sjec.ac.in email</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">👨‍💼</span>
                            <span>Admin: Use authorized admin email</span>
                        </div>
                    </div>
                </div>

                <div className="login-footer">
                    <p>© 2026 QuikServ - SJEC Canteen</p>
                </div>
            </div>
        </div>
    );
}
