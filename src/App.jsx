import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './canteen/pages/Login';
import Menu from './canteen/pages/Menu';
import Orders from './canteen/pages/Orders';
import Layout from './canteen/components/Layout';
import ProtectedRoute from './canteen/components/ProtectedRoute';
import { ToastProvider } from './shared/context/ToastContext';

function App() {
    return (
        <ToastProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/" element={<Navigate to="/menu" replace />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/orders" element={<Orders />} />
                    </Route>
                </Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
