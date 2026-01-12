import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to login. Check console.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#242424' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px', padding: '2rem', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#333' }}>
                <h2 style={{ textAlign: 'center', margin: 0 }}>Staff Login</h2>
                {error && <p style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</p>}
                <input
                    type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: 'white' }}
                />
                <input
                    type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: 'white' }}
                />
                <button type="submit" style={{ marginTop: '1rem', backgroundColor: '#646cff', color: 'white' }}>Login</button>
            </form>
        </div>
    );
}
