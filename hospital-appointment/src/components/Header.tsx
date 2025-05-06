import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Header.css';
import logoImage from '../assets/logo.png';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        console.log('Header - Current user:', storedUser);
        setUser(storedUser);
    }, [location]);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate('/login', { replace: true });
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo-section">
                    <Link to="/" className="logo-link">
                        <img src={logoImage} alt="Logo" className="header-logo" />
                        <span className="logo-text">Lofi Pharma</span>
                    </Link>
                </div>

                <nav className="nav-links">
                    <Link to="/">Trang chủ</Link>
                    <Link to="/about">Giới thiệu</Link>
                    <Link to="/services">Dịch vụ</Link>
                    <Link to="/contact">Liên hệ</Link>
                </nav>

                {user ? (
                    <div className="user-section">
                        <div
                            className="user-info"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <img
                                src={user.avatarUrl || "https://via.placeholder.com/32"}
                                alt="Avatar"
                                className="user-avatar"
                            />
                            <span className="user-name">Chào, {user.name}</span>
                            <svg
                                className={`dropdown-icon ${showDropdown ? 'open' : ''}`}
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                            >
                                <path
                                    d="M2 4L6 8L10 4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            </svg>
                        </div>

                        {showDropdown && (
                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item">
                                    <svg className="item-icon" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                    Thông tin cá nhân
                                </Link>
                                <Link to="/settings" className="dropdown-item">
                                    <svg className="item-icon" viewBox="0 0 24 24">
                                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                    </svg>
                                    Cài đặt
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout">
                                    <svg className="item-icon" viewBox="0 0 24 24">
                                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                    </svg>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="login-btn">Đăng nhập</Link>
                        <Link to="/register" className="register-btn">Đăng ký</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header; 