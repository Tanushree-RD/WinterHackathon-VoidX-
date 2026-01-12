import React, { createContext, useContext, useState, useCallback } from 'react';
import './../components/Toast.css';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, exiting: false }]);

        // Auto remove after 3 seconds
        setTimeout(() => removeToast(id), 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300); // Wait for animation
    };

    const success = (msg) => addToast(msg, 'success');
    const error = (msg) => addToast(msg, 'error');
    const info = (msg) => addToast(msg, 'info');

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast ${toast.type} ${toast.exiting ? 'exiting' : ''}`}>
                        {toast.type === 'success' && <CheckCircle size={20} color="#4caf50" />}
                        {toast.type === 'error' && <AlertCircle size={20} color="#f44336" />}
                        {toast.type === 'info' && <Info size={20} color="#2196f3" />}
                        <span className="toast-message">{toast.message}</span>
                        <X
                            size={16}
                            style={{ marginLeft: 'auto', cursor: 'pointer', opacity: 0.7 }}
                            onClick={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
