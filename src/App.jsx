import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './shared/pages/Login';
import RoleProtectedRoute from './shared/components/RoleProtectedRoute';

// Admin (Canteen) imports
import AllItems from './canteen/pages/AllItems';
import DailyMenu from './canteen/pages/DailyMenu';
import CanteenOrders from './canteen/pages/Orders';
import CanteenLayout from './canteen/components/Layout';

// User imports
import UserMenu from './Users/pages/UserMenu';
import UserCart from './Users/pages/UserCart';
import UserLayout from './Users/components/UserLayout';

// Shared
import { ToastProvider } from './shared/context/ToastContext';
import { AuthProvider } from './shared/context/AuthContext';
import { MenuProvider } from './shared/context/MenuContext';
import { CartProvider } from './shared/context/CartContext';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <MenuProvider>
                    <CartProvider>
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
                                    <Route path="items" element={<AllItems />} />
                                    <Route path="menu" element={<DailyMenu />} />
                                    <Route path="orders" element={<CanteenOrders />} />
                                    <Route index element={<Navigate to="menu" replace />} />
                                </Route>

                                {/* User Routes - Protected for user role only */}
                                <Route
                                    path="/users"
                                    element={
                                        <RoleProtectedRoute requiredRole="user">
                                            <UserLayout />
                                        </RoleProtectedRoute>
                                    }
                                >
                                    <Route path="menu" element={<UserMenu />} />
                                    <Route path="cart" element={<UserCart />} />
                                    <Route index element={<Navigate to="menu" replace />} />
                                </Route>

                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </Router>
                    </CartProvider>
                </MenuProvider>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
