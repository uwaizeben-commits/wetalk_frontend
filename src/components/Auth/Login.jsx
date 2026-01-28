import React, { useState } from 'react';

const Login = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && password) {
            onLogin({ username, password });
        }
    };

    return (
        <div className="auth-page fade-in">
            <div className="auth-card glass">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to <span>Wetalk</span></p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-footer-links">
                        <button type="button" onClick={onForgotPassword} className="text-btn small">Forgot username or password?</button>
                    </div>
                    <button type="submit" className="auth-btn">Sign In</button>
                </form>
                <div className="auth-footer">
                    <p>Don't have an account? <button onClick={onSwitchToRegister} className="text-btn">Create one</button></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
