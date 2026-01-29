import React, { useState, useEffect } from 'react';
import API_URL from '../config';

const Recovery = ({ onSwitchToLogin }) => {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Reset/Result
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/recovery/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await response.json();
            if (response.ok) {
                setStep(2);
                setTimer(30);
                setCanResend(false);
                alert(`DEMO RECOVERY: Your OTP is ${data.otp}`);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/recovery/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await response.json();
            if (response.ok) {
                setUsername(data.username);
                setStep(3);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return setError('Password must be at least 6 characters');

        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/recovery/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, newPassword })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Password reset successful! Redirecting to login...');
                onSwitchToLogin();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page fade-in">
            <div className="auth-card glass">
                <div className="auth-header">
                    <h1>Account Recovery</h1>
                    <p>
                        {step === 1 && "Enter your registered phone number"}
                        {step === 2 && `Enter the code sent to ${phone}`}
                        {step === 3 && "Recovery Successful!"}
                    </p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestOTP} className="auth-form">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+1 234 567 890"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? "Checking..." : "Send Reset Code"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerify} className="auth-form">
                        <div className="form-group">
                            <label>OTP Code</label>
                            <input
                                type="text"
                                placeholder="123456"
                                maxLength="6"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Verify Code"}
                        </button>
                        <div className="otp-footer">
                            <button type="button" className="text-btn" onClick={() => setStep(1)}>Change Number</button>
                            <p>{canResend ? <button type="button" className="text-btn" onClick={handleRequestOTP}>Resend</button> : `${timer}s`}</p>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="recovery-success">
                        <div className="info-box glass">
                            <label>Your Username</label>
                            <p className="username-reveal">@{username}</p>
                        </div>

                        <form onSubmit={handleResetPassword} className="auth-form mt-4">
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Reset Password & Login"}
                            </button>
                        </form>
                    </div>
                )}

                <div className="auth-footer">
                    <button onClick={onSwitchToLogin} className="text-btn">Back to Login</button>
                </div>
            </div>
        </div>
    );
};

export default Recovery;
