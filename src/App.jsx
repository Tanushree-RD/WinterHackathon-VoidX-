import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './shared/auth/Login';
import RoleBasedRoute from './shared/auth/RoleBasedRoute';

// Canteen imports
import CanteenMenu from './canteen/pages/Menu';
import CanteenOrders from './canteen/pages/Orders';
import CanteenLayout from './canteen/components/Layout';
import CanteenProtectedRoute from './canteen/components/ProtectedRoute';

// Shared
import { ToastProvider } from './shared/context/ToastContext';

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>
                    {/* Public Login Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Root - Role-based redirect */}
                    <Route path="/" element={<RoleBasedRoute />} />

                    {/* Canteen Routes */}
                    <Route path="/canteen" element={<CanteenProtectedRoute><CanteenLayout /></CanteenProtectedRoute>}>
                        <Route path="menu" element={<CanteenMenu />} />
                        <Route path="orders" element={<CanteenOrders />} />
                        <Route index element={<Navigate to="menu" replace />} />
                    </Route>

                    {/* Client Routes - Placeholder for future development */}
                    <Route path="/client" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Client Dashboard Coming Soon</div>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
