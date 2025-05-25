import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Login.css';
import logoImage from '../assets/logo.png';
import axios from 'axios';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Kiểm tra nếu đã đăng nhập thì chuyển hướng
        const token = localStorage.getItem('token');
        if (token) {
            const userData = localStorage.getItem('user');
            if (userData) {
                const userInfo = JSON.parse(userData);
                if (userInfo.role === "DOCTOR") {
                    navigate('/doctor');
                } else if (userInfo.role === "PATIENT") {
                    navigate('/home');
                }
            } else {
                navigate('/admin');
            }
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('Login - Attempting login with:', formData.email);
            const response = await authService.login({ email: formData.email, password: formData.password });
            console.log('Login - Login successful, response:', response);

            // Verify token was stored correctly
            const storedToken = localStorage.getItem('token');
            console.log('Login - Stored token exists:', !!storedToken);

            if (!storedToken) {
                throw new Error('Token was not stored properly');
            }

            // Kiểm tra loại tài khoản và chuyển hướng phù hợp
            const userData = localStorage.getItem('user');
            console.log('User data:', userData);

            if (userData) {
                const userInfo = JSON.parse(userData);
                console.log('Parsed user info:', userInfo);

                if (userInfo.role === "PATIENT") {
                    // Kiểm tra trạng thái enabled của user
                    if (userInfo.user && userInfo.user.enabled === false) {
                        // Nếu tài khoản bị khóa
                        navigate('/account-disabled', { replace: true });
                    } else {
                        // Nếu tài khoản hoạt động bình thường
                        navigate('/home', { replace: true });
                    }
                } else if (userInfo.role === "DOCTOR") {
                    console.log('Redirecting to doctor page');
                    // Bác sĩ không cần kiểm tra enabled
                    navigate('/doctor', { replace: true });
                }
            } else {
                // Nếu không có user data -> là admin
                navigate('/admin', { replace: true });
            }
        } catch (error) {
            console.error('Login - Error during login:', error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
                setError(errorMessage);
            } else {
                setError('Đã xảy ra lỗi không xác định');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-left">
                    <div className="logo-container">
                        <img src={logoImage} alt="Logo" className="login-logo" />
                        <h1 className="logo-text">Lofi Pharma</h1>
                    </div>
                    <div className="greeting">
                        <h2>Chào mừng trở lại!</h2>
                        <p>Đăng nhập để tiếp tục quản lý lịch hẹn y tế của bạn</p>
                    </div>
                </div>
                <div className="login-right">
                    <h2>Đăng Nhập</h2>
                    <p className="subtitle">Nhập thông tin đăng nhập của bạn</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Nhập email của bạn"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập mật khẩu của bạn"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={togglePasswordVisibility}
                                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                            </button>
                        </div>
                    </form>

                    <div className="register-link">
                        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;