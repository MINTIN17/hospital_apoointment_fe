import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Profile.css';
import logoImage from '../assets/logo.png';

interface UserData {
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    avatarUrl?: string;
    bloodType?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    medicalConditions?: string;
    currentMedications?: string;
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<UserData>({ name: '', email: '' });
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    useEffect(() => {
        console.log('Profile - Component mounted');
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log('Profile - User data loaded:', parsedUser);
                console.log('Birth date from storage:', parsedUser.dateOfBirth);
                setUser(parsedUser);
            } catch (error) {
                console.error('Profile - Error parsing user data:', error);
            }
        } else {
            console.log('Profile - No user data found');
        }
    }, []);

    const handleLogout = () => {
        console.log('Profile - Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const formatDate = (dateString: string | undefined): string => {
        console.log('Formatting date:', dateString);
        if (!dateString) return "Chưa cập nhật";
        try {
            // Kiểm tra nếu dateString đã ở định dạng dd/mm/yyyy
            if (dateString.includes('/')) {
                console.log('Date already in dd/mm/yyyy format:', dateString);
                return dateString;
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.log('Invalid date:', dateString);
                return "Chưa cập nhật";
            }
            const formattedDate = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            console.log('Formatted date:', formattedDate);
            return formattedDate;
        } catch (error) {
            console.error('Error formatting date:', error);
            return "Chưa cập nhật";
        }
    };

    const parseDate = (dateString: string): string => {
        if (!dateString || dateString === "Chưa cập nhật") return '';
        try {
            // Kiểm tra nếu dateString đã ở định dạng dd/mm/yyyy
            if (dateString.includes('/')) {
                const [day, month, year] = dateString.split('/');
                return `${year}-${month}-${day}`;
            }
            return dateString;
        } catch (error) {
            console.error('Error parsing date:', error);
            return '';
        }
    };

    const handleEdit = (field: string, value: string) => {
        setEditingField(field);
        if (field === 'birthDate') {
            setEditValue(parseDate(value));
        } else {
            setEditValue(value);
        }
    };

    const handleSave = (field: string) => {
        let valueToSave = editValue;
        if (field === 'birthDate') {
            try {
                console.log('Saving birth date:', editValue);
                const date = new Date(editValue);
                if (!isNaN(date.getTime())) {
                    valueToSave = date.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    console.log('Formatted birth date for save:', valueToSave);
                }
            } catch (error) {
                console.error('Error saving date:', error);
            }
        }
        const updatedUser = { ...user, [field]: valueToSave };
        console.log('Updated user data:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setEditingField(null);
    };

    const handleCancel = () => {
        setEditingField(null);
    };

    const renderField = (field: string, label: string, value: string | number | undefined, isLocked: boolean = false) => {
        const displayValue = field === 'birthDate' ? formatDate(value as string) : (value || (isLocked ? value : "Chưa cập nhật"));

        if (editingField === field) {
            return (
                <div className="info-item editing">
                    <label>{label}</label>
                    <div className="edit-controls">
                        {field === 'birthDate' ? (
                            <input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                            />
                        ) : (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                            />
                        )}
                        <div className="edit-buttons">
                            <button onClick={() => handleSave(field)} className="save-btn">Lưu</button>
                            <button onClick={handleCancel} className="cancel-btn">Hủy</button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`info-item ${isLocked ? 'locked' : 'editable'}`} onClick={() => !isLocked && handleEdit(field, displayValue as string)}>
                <label>{label}</label>
                <p>{displayValue}</p>
            </div>
        );
    };

    return (
        <div className="profile-page">
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
                        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="main-nav">
                <div className="nav-content">
                    <div className="logo">
                        <Link to="/home" className="logo-link">
                            <img src={logoImage} alt="Lofi Pharma" />
                            <span>Lofi Pharma</span>
                        </Link>
                    </div>
                    <ul className="nav-links">
                        <li>
                            <Link
                                to="/home"
                                className={location.pathname === '/home' ? 'active' : ''}
                            >
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/profile"
                                className={location.pathname === '/profile' ? 'active' : ''}
                            >
                                Hồ sơ
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/appointments"
                                className={location.pathname === '/appointments' ? 'active' : ''}
                            >
                                Lịch khám
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/medical-history"
                                className={location.pathname === '/medical-history' ? 'active' : ''}
                            >
                                Lịch sử khám bệnh
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Profile Content */}
            <div className="profile-content">
                {/* Medical Record Header */}
                <div className="medical-record-header">
                    <h1>HỒ SƠ BỆNH ÁN</h1>
                    <p>Bệnh viện Lofi Pharma</p>
                </div>

                {/* Patient Info Section */}
                <div className="patient-info">
                    <div className="patient-info-header">
                        <div className="avatar-container">
                            <img
                                src={user.avatarUrl || "https://via.placeholder.com/150"}
                                alt="Patient Avatar"
                                className="patient-avatar"
                            />
                            <button className="change-avatar-btn" onClick={() => alert('Tính năng đang phát triển')}>Thay ảnh</button>
                        </div>
                        <div className="patient-basic-info">
                            <div className="info-grid">
                                {renderField('name', 'Họ và tên', user.name)}
                                {renderField('email', 'Email', user.email, true)}
                                {renderField('phone', 'Số điện thoại', user.phone, true)}
                                {renderField('birthDate', 'Ngày sinh', user.dateOfBirth)}
                                {renderField('gender', 'Giới tính', user.gender)}
                                {renderField('address', 'Địa chỉ', user.address)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Info Section */}
                <div className="medical-info">
                    <div className="section-header">
                        <h2>Thông tin y tế</h2>
                    </div>
                    <div className="info-grid">
                        {renderField('bloodType', 'Nhóm máu', user.bloodType)}
                        {renderField('height', 'Chiều cao', user.height ? `${user.height} cm` : undefined)}
                        {renderField('weight', 'Cân nặng', user.weight ? `${user.weight} kg` : undefined)}
                        {renderField('allergies', 'Dị ứng', user.allergies)}
                        {renderField('medicalConditions', 'Bệnh nền', user.medicalConditions)}
                        {renderField('currentMedications', 'Thuốc đang sử dụng', user.currentMedications)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 