import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import logoImage from '../assets/logo.png';
import doctorTeamImage from '../assets/doctor-team.jpg';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('appointments');

    const handleLogout = () => {
        // TODO: Implement actual logout logic here
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-content">
                    <div className="contact-info">
                        <span>📞 1900 6750</span>
                        <span className="separator">|</span>
                        <span>✉️ support@sapo.vn</span>
                    </div>
                    <div className="user-info">
                        <span>Xin chào, Nguyễn Văn A</span>
                        <button className="logout-button" onClick={handleLogout}>Đăng xuất</button>
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
                    <ul className="nav-links">
                        <li><a href="#" className="active">Trang chủ</a></li>
                        <li><a href="#">Giới thiệu</a></li>
                        <li><a href="#">Chuẩn đoán</a></li>
                        <li><a href="#">Danh sách các bệnh viện</a></li>
                        <li><a href="#">Đặt lịch khám bệnh</a></li>
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="dashboard-sidebar">
                    <div className="user-profile">
                        <div className="profile-image">
                            <img src="https://via.placeholder.com/100" alt="User Profile" />
                        </div>
                        <h3>Nguyễn Văn A</h3>
                        <p>nguyenvana@example.com</p>
                    </div>
                    <ul className="sidebar-menu">
                        <li className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
                            <span className="icon">📅</span> Lịch hẹn của tôi
                        </li>
                        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <span className="icon">👤</span> Thông tin cá nhân
                        </li>
                        <li className={activeTab === 'medical-records' ? 'active' : ''} onClick={() => setActiveTab('medical-records')}>
                            <span className="icon">📋</span> Hồ sơ y tế
                        </li>
                        <li className={activeTab === 'hospitals' ? 'active' : ''} onClick={() => setActiveTab('hospitals')}>
                            <span className="icon">🏥</span> Bệnh viện
                        </li>
                        <li className={activeTab === 'doctors' ? 'active' : ''} onClick={() => setActiveTab('doctors')}>
                            <span className="icon">👨‍⚕️</span> Bác sĩ
                        </li>
                        <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                            <span className="icon">⚙️</span> Cài đặt
                        </li>
                    </ul>
                </div>
                <div className="dashboard-main">
                    <div className="dashboard-header">
                        <h1>Bảng điều khiển</h1>
                        <div className="date-time">
                            <span className="date">Thứ 2, 15 Tháng 4, 2024</span>
                            <span className="time">14:30</span>
                        </div>
                    </div>

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2>Lịch hẹn của tôi</h2>
                                <button className="primary-button">Đặt lịch mới</button>
                            </div>
                            <div className="appointments-list">
                                <div className="appointment-card">
                                    <div className="appointment-date">
                                        <span className="day">20</span>
                                        <span className="month">Tháng 4</span>
                                    </div>
                                    <div className="appointment-details">
                                        <h3>Khám tổng quát</h3>
                                        <p><strong>Bác sĩ:</strong> BS. Trần Văn B</p>
                                        <p><strong>Bệnh viện:</strong> Bệnh viện Đa khoa Quốc tế</p>
                                        <p><strong>Thời gian:</strong> 09:00 - 10:00</p>
                                    </div>
                                    <div className="appointment-actions">
                                        <button className="action-button">Chi tiết</button>
                                        <button className="action-button cancel">Hủy</button>
                                    </div>
                                </div>
                                <div className="appointment-card">
                                    <div className="appointment-date">
                                        <span className="day">25</span>
                                        <span className="month">Tháng 4</span>
                                    </div>
                                    <div className="appointment-details">
                                        <h3>Khám răng</h3>
                                        <p><strong>Bác sĩ:</strong> BS. Lê Thị C</p>
                                        <p><strong>Bệnh viện:</strong> Phòng khám Nha khoa</p>
                                        <p><strong>Thời gian:</strong> 14:30 - 15:30</p>
                                    </div>
                                    <div className="appointment-actions">
                                        <button className="action-button">Chi tiết</button>
                                        <button className="action-button cancel">Hủy</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2>Thông tin cá nhân</h2>
                                <button className="primary-button">Chỉnh sửa</button>
                            </div>
                            <div className="profile-info">
                                <div className="profile-field">
                                    <label>Họ và tên</label>
                                    <p>Nguyễn Văn A</p>
                                </div>
                                <div className="profile-field">
                                    <label>Email</label>
                                    <p>nguyenvana@example.com</p>
                                </div>
                                <div className="profile-field">
                                    <label>Số điện thoại</label>
                                    <p>0123456789</p>
                                </div>
                                <div className="profile-field">
                                    <label>Địa chỉ</label>
                                    <p>123 Đường ABC, Quận XYZ, TP. Hà Nội</p>
                                </div>
                                <div className="profile-field">
                                    <label>Ngày sinh</label>
                                    <p>01/01/1990</p>
                                </div>
                                <div className="profile-field">
                                    <label>Giới tính</label>
                                    <p>Nam</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other tabs would be implemented similarly */}
                    {activeTab !== 'appointments' && activeTab !== 'profile' && (
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2>{activeTab === 'medical-records' ? 'Hồ sơ y tế' :
                                    activeTab === 'hospitals' ? 'Bệnh viện' :
                                        activeTab === 'doctors' ? 'Bác sĩ' : 'Cài đặt'}</h2>
                            </div>
                            <div className="placeholder-content">
                                <p>Nội dung cho tab {activeTab} sẽ được hiển thị ở đây.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Lofi Pharma</h3>
                        <p>
                            Cửa hàng thực phẩm chức năng Lofi Pharma là địa chỉ tin cậy để bạn tìm kiếm những sản phẩm chất lượng nhất.
                        </p>
                    </div>
                    <div className="footer-section">
                        <h4>LIÊN KẾT NHANH</h4>
                        <ul>
                            <li><a href="#">Trang chủ</a></li>
                            <li><a href="#">Giới thiệu</a></li>
                            <li><a href="#">Sản phẩm</a></li>
                            <li><a href="#">Liên hệ</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>THÔNG TIN LIÊN HỆ</h4>
                        <p>🏢 Tòa nhà Ladeco, 266 Đội Cấn, P. Liễu Giai, Q. Ba Đình, TP Hà Nội</p>
                        <p>📞 1900 6750</p>
                        <p>✉️ support@sapo.vn</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Lofi Pharma. Tất cả quyền được bảo lưu.</p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard; 