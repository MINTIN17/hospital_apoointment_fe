import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/HomePage.css';
import logoImage from '../assets/logo.png';
import doctorTeamImage from '../assets/doctor-team.jpg';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setShowDropdown(false);
    };

    return (
        <div className="landing-page">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-content">
                    <div className="contact-info">
                        <span>📞 1900 6750</span>
                        <span className="separator">|</span>
                        <span>✉️ support@sapo.vn</span>
                    </div>
                    <div className="user-greeting">
                        <span>Xin chào, {user.name}!</span>
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
                                <div className="dropdown-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                    </svg>
                                    <span>Cài đặt</span>
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
                    <ul className="nav-links">
                        <li><a href="#" className="active">Trang chủ</a></li>
                        <li><a href="#">Giới thiệu</a></li>
                        <li><a href="#">Chuẩn đoán</a></li>
                        <li><a href="#">Danh sách các bệnh viện</a></li>
                        <li><a href="#">Đặt lịch khám bệnh</a></li>
                    </ul>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Chuyên Gia Y Tế Giàu Kinh Nghiệm</h1>
                        <p>
                            Được thành lập vào năm 2015, Lofi Pharma là một trong những chuỗi bán lẻ dược phẩm đầu tiên
                            tại Việt Nam. Đến nay, Lofi Pharma sở hữu mạng lưới hơn 100 nhà thuốc đạt chuẩn GPP trên
                            toàn quốc cùng đội ngũ hơn 500 dược sĩ đang làm việc, cung cấp các sản phẩm thuốc và sản
                            phẩm chăm sóc sức khỏe hàng đầu với giá thành cạnh tranh nhất.
                        </p>
                        <div className="cta-buttons">
                            <button className="cta-button">MUA NGAY</button>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src={doctorTeamImage} alt="Doctor Team" />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-icon">👥</div>
                        <div className="stat-number">200K+</div>
                        <div className="stat-label">Khách Hàng Vui Vẻ</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">📦</div>
                        <div className="stat-number">50K+</div>
                        <div className="stat-label">Đơn Hàng Đã Giao</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">🏪</div>
                        <div className="stat-number">20+</div>
                        <div className="stat-label">Cửa Hàng</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">💊</div>
                        <div className="stat-number">5K+</div>
                        <div className="stat-label">Các Loại Thuốc</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Lofi Pharma</h3>
                        <p>
                            Cửa hàng thực phẩm chức năng Lofi Pharma là địa chỉ tin cậy để bạn tìm kiếm những sản phẩm chất lượng nhất.
                        </p>
                        <p>Mã số thuế: 0123456789 do Sở kế hoạch và Đầu tư Tp Hà Nội cấp ngày 13/09/2024</p>
                        <p>🏢 Tòa nhà Ladeco, 266 Đội Cấn, P. Liễu Giai, Q. Ba Đình, TP Hà Nội</p>
                        <p>📞 1900 6750</p>
                        <p>✉️ support@sapo.vn</p>
                    </div>

                    <div className="footer-section">
                        <h4>VỀ CHÚNG TÔI</h4>
                        <ul>
                            <li><a href="#">Trang chủ</a></li>
                            <li><a href="#">Giới thiệu</a></li>
                            <li><a href="#">Sản phẩm</a></li>
                            <li><a href="#">Góc sức khỏe</a></li>
                            <li><a href="#">Video</a></li>
                            <li><a href="#">Liên hệ</a></li>
                            <li><a href="#">Đặt lịch tư vấn</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>CHÍNH SÁCH</h4>
                        <ul>
                            <li><a href="#">Chính sách giao hàng</a></li>
                            <li><a href="#">Chính sách đổi trả</a></li>
                            <li><a href="#">Chính sách bán hàng</a></li>
                            <li><a href="#">Chính sách thành viên</a></li>
                            <li><a href="#">Bảo mật thông tin cá nhân</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>THÔNG TIN LIÊN HỆ</h4>
                        <div className="contact-info">
                            <div>
                                <strong>Mua hàng:</strong>
                                <p>19006750</p>
                            </div>
                            <div>
                                <strong>Khiếu nại:</strong>
                                <p>19006750</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage; 