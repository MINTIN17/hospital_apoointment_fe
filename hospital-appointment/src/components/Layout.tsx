import React, { useState } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import '../styles/Layout.css';
import logoImage from '../assets/logo.png';
import { authService } from '../services/api';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setShowDropdown(false);
    };

    const handleChangePassword = async () => {
        try {
            if (!currentPassword || !newPassword || !confirmPassword) {
                setPasswordError('Vui lòng nhập đầy đủ thông tin');
                return;
            }

            if (newPassword !== confirmPassword) {
                setPasswordError('Mật khẩu mới không khớp');
                return;
            }

            if (currentPassword === newPassword) {
                setPasswordError('Mật khẩu mới không được giống mật khẩu cũ');
                return;
            }

            if (newPassword.length < 8) {
                setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
                return;
            }

            if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
                setPasswordError('Mật khẩu phải có cả chữ hoa và chữ thường');
                return;
            }

            if (!/[0-9]/.test(newPassword)) {
                setPasswordError('Mật khẩu phải có ít nhất 1 số');
                return;
            }

            if (/[^A-Za-z0-9]/.test(newPassword)) {
                setPasswordError('Mật khẩu không được chứa ký tự đặc biệt');
                return;
            }

            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            const patientId = userInfo.id;

            if (!patientId) {
                setPasswordError('Không tìm thấy thông tin người dùng');
                return;
            }

            const response = await authService.changePassword({
                old_password: currentPassword,
                new_password: newPassword,
                patient_id: patientId
            });
            if (response === 'Password changed successfully') {
                alert('Đổi mật khẩu thành công');
                setShowChangePasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError(null);
            } else {
                if (response === 'Old password is incorrect') {
                    setPasswordError('Mật khẩu cũ không đúng');
                } else {
                    setPasswordError(response.toString() || 'Đổi mật khẩu thất bại');
                }
            }
        } catch (error: any) {
            if (error.response?.data?.message === 'Old password is incorrect') {
                setPasswordError('Mật khẩu cũ không đúng');
            } else {
                setPasswordError(error.response?.data?.message || 'Đổi mật khẩu thất bại');
            }
        }
    };

    return (
        <div className="layout">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-content">
                    <div className="contact-info">
                        <span>📞 1900 6750</span>
                        <span className="separator">|</span>
                        <span>✉️ support@sapo.vn</span>
                    </div>
                    <div className="user-greeting">
                        <span>Xin chào, {user.user?.name}!</span>
                        <div className="settings-icon" onClick={() => setShowDropdown(!showDropdown)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </div>
                        {showDropdown && (
                            <div className="settings-dropdown">
                                <div className="dropdown-item" onClick={handleProfileClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span>Hồ sơ</span>
                                </div>
                                <div className="dropdown-item" onClick={() => {
                                    setShowChangePasswordModal(true);
                                    setShowDropdown(false);
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    <span>Đổi mật khẩu</span>
                                </div>
                                <div className="dropdown-item" onClick={handleLogout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    <span>Đăng xuất</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="main-nav">
                <div className="nav-content">
                    <div className="logo">
                        <img src={logoImage} alt="Lofi Pharma" />
                        <span>Lofi Pharma</span>
                    </div>
                    <div className="nav-links">
                        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
                        <NavLink to="/introduction" className={({ isActive }) => isActive ? 'active' : ''}>Giới thiệu</NavLink>
                        <NavLink to="/diagnosis" className={({ isActive }) => isActive ? 'active' : ''}>Chuẩn đoán</NavLink>
                        <NavLink to="/hospitals" className={({ isActive }) => isActive ? 'active' : ''}>Danh sách các bệnh viện</NavLink>
                        <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>Lịch sử khám bệnh</NavLink>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Đổi mật khẩu</h3>
                            <button className="close-button" onClick={() => setShowChangePasswordModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <div className="password-input">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                    <button
                                        className="toggle-password"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <div className="password-input">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                    <button
                                        className="toggle-password"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới</label>
                                <div className="password-input">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                    <button
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                            </div>
                            {passwordError && <div className="error-message">{passwordError}</div>}
                            <div className="password-requirements">
                                <p>Mật khẩu phải có:</p>
                                <ul>
                                    <li>Ít nhất 8 ký tự</li>
                                    <li>Chữ hoa và chữ thường</li>
                                    <li>Ít nhất 1 số</li>
                                    <li>Không chứa ký tự đặc biệt</li>
                                </ul>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowChangePasswordModal(false)}>
                                Hủy
                            </button>
                            <button className="save-button" onClick={handleChangePassword}>
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout; 