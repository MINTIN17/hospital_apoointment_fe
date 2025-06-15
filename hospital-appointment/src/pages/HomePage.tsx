import React from 'react';
import '../styles/HomePage.css';
import doctorTeamImage from '../assets/doctor-team.jpg';

const HomePage: React.FC = () => {
    return (
        <div className="home-content">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Chuyên Gia Y Tế Giàu Kinh Nghiệm</h1>
                        <p>
                        Được thành lập vào năm 2015, VietNam Pharma là một trong những nền tảng tiên phong trong lĩnh vực đặt lịch khám bệnh trực tuyến tại Việt Nam. Với sứ mệnh kết nối người bệnh với các cơ sở y tế uy tín, đến nay VietNam Pharma đã hợp tác với hơn 100 bệnh viện và phòng khám đạt chuẩn trên toàn quốc.
                        </p>
                        <div className="cta-buttons">
                            <button className="cta-button">KHÁM NGAY</button>
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
                        <div className="stat-label">Cuộc hẹn khám bệnh</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">🏪</div>
                        <div className="stat-number">100+</div>
                        <div className="stat-label">Bệnh viện</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">💊</div>
                        <div className="stat-number">100+</div>
                        <div className="stat-label">Chuyên khoa</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Lofi Pharma</h3>
                        <p>
                        VietNam Pharma là địa chỉ tin cậy dành cho bạn khi cần đặt lịch khám bệnh nhanh chóng, dễ dàng và hiệu quả. Chúng tôi mang đến giải pháp hiện đại giúp bạn kết nối với bác sĩ, bệnh viện và phòng khám uy tín chỉ bằng vài thao tác trên nền tảng.
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
                            <li><a href="#">Góc sức khỏe</a></li>
                            <li><a href="#">Video</a></li>
                            <li><a href="#">Liên hệ</a></li>
                            <li><a href="#">Đặt lịch tư vấn</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>CHÍNH SÁCH</h4>
                        <ul>
                            <li><a href="#">Chính sách y tế</a></li>
                            <li><a href="#">Chính sách khám bệnh</a></li>
                            <li><a href="#">Chính sách quyền lợi khách hàng</a></li>
                            <li><a href="#">Chính sách bệnh viện</a></li>
                            <li><a href="#">Bảo mật thông tin cá nhân</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>THÔNG TIN LIÊN HỆ</h4>
                        <div className="contact-info">
                            <div>
                                <strong>Tư vấn:</strong>
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