import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './shared/pages/Login';
import RoleProtectedRoute from './shared/components/RoleProtectedRoute';

// Admin (Canteen) imports
import CanteenMenu from './canteen/pages/Menu';
import CanteenOrders from './canteen/pages/Orders';
import CanteenLayout from './canteen/components/Layout';

// User imports
import UserMenu from './Users/pages/UserMenu';

// Shared
import { ToastProvider } from './shared/context/ToastContext';
import { AuthProvider } from './shared/context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <Routes>
                        {/* Public Login Route */}
                        <Route path="/login" element={<Login />} />

                        {/* Root - Redirect to login */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Admin Routes - Protected for admin role only */}
                        <Route
                            path="/admin"
                            element={
                                <RoleProtectedRoute requiredRole="admin">
                                    <CanteenLayout />
                                </RoleProtectedRoute>
                            }
                        >
                            <Route path="menu" element={<CanteenMenu />} />
                            <Route path="orders" element={<CanteenOrders />} />
                            <Route index element={<Navigate to="menu" replace />} />
                        </Route>

                        {/* User Routes - Protected for user role only */}
                        <Route
                            path="/users"
                            element={
                                <RoleProtectedRoute requiredRole="user">
                                    <div>User Layout Placeholder</div>
                                </RoleProtectedRoute>
                            }
                        >
                            <Route path="menu" element={<UserMenu />} />
                            <Route index element={<Navigate to="menu" replace />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
