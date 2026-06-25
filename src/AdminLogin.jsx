
import React, { useState } from 'react';
import './AdminLogin.css'; // Importing the separate stylesheet

const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Strict frontend validation condition
        const isAdminValid = (email === 'admin@rashi.com' && password === 'securepassword123');

        if (isAdminValid) {
            onLoginSuccess(); // Fires true outcome to Parent App
        } else {
            setError('Access Denied: Invalid admin credentials.');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-card">
                <h2 className="login-title">Rashi Control Login</h2>
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label>Admin Email</label>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="form-input"
                        placeholder="admin@rashi.com"
                    />
                </div>
                
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="form-input"
                        placeholder="••••••••"
                    />
                </div>
                
                <button type="submit" className="submit-btn">
                    Authenticate Admin
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;