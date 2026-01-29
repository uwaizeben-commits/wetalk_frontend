import React, { useState, useEffect } from 'react';

const Register = ({ onRegister, onSwitchToLogin }) => {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        firstName: '',
        lastname: '',
        username: '',
        phone: '',
        password: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:3001/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone })
            });
            const data = await response.json();
            if (response.ok) {
                setStep(2);
                setTimer(30);
                setCanResend(false);
                // OTP sent to console, not screen alert
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalRegister = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            onRegister({ ...formData, otp });
        } else {
            setError('Please enter a valid 6-digit OTP');
        }
    };

    return (
        <div className="auth-page fade-in">
            <div className="auth-card glass">
                <div className="auth-header">
                    <h1>{step === 1 ? 'Create Account' : 'Verify Phone'}</h1>
                    <p>
                        {step === 1 ? (
                            <>Join <span>Wetalk</span> and start chatting</>
                        ) : (
                            <>Enter the code sent to <span>{formData.phone}</span></>
                        )}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastname">Last Name</label>
                                <input
                                    type="text"
                                    id="lastname"
                                    placeholder="Doe"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="johndoe123"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Next'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleFinalRegister} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="123456"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                autoFocus
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="auth-btn">Verify & Create Account</button>

                        <div className="otp-footer">
                            <button
                                type="button"
                                className="text-btn"
                                onClick={() => setStep(1)}
                            >
                                Change Phone Number
                            </button>
                            <p>
                                {canResend ? (
                                    <button type="button" onClick={handleRequestOTP} className="text-btn">Resend OTP</button>
                                ) : (
                                    `Resend in ${timer}s`
                                )}
                            </p>
                        </div>
                    </form>
                )}

                <div className="auth-footer">
                    <p>Already have an account? <button onClick={onSwitchToLogin} className="text-btn">Sign in</button></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
