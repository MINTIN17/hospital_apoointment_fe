import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AccountDisabled.css';
import logoImage from '../assets/logo.png';

const AccountDisabled: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="disabled-container">
            <div className="disabled-box">
                <div className="logo-container">
                    <img src={logoImage} alt="Logo" className="logo" />
                    <h1 className="logo-text">Lofi Pharma</h1>
                </div>
                <div className="message-container">
                    <div className="icon">🔒</div>
                    <h2>Tài khoản đã bị khóa</h2>
                    <p>Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên để được hỗ trợ.</p>
                    <button onClick={handleLogout} className="logout-button">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountDisabled; 