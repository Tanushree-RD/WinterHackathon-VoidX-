import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
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
    );
}

export default App;
