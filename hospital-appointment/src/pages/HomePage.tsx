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