import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Doctor.css';
import logoImage from '../assets/logo.png';

interface Doctor {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
    about: string;
    specialization_name: string;
    yearsOfExperience: number;
    hospital: {
        id: number;
        name: string;
        address: string;
    };
}

const Doctor: React.FC = () => {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [activeTab, setActiveTab] = useState('appointments');
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<{ [key: string]: boolean }>({});

    // Tạo mảng các ngày trong tuần
    const weekDays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    // Tạo mảng các khung giờ
    const timeSlots = Array.from({ length: 10 }, (_, i) => {
        const hour = i + 8; // Từ 8h đến 17h
        return `${hour}:00`;
    });

    const handleSlotChange = (dayIndex: number, timeIndex: number) => {
        const key = `${dayIndex}-${timeIndex}`;
        setSelectedSlots(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSelectAllDay = (dayIndex: number) => {
        const newSelectedSlots = { ...selectedSlots };
        const allSelected = timeSlots.every((_, timeIndex) => selectedSlots[`${dayIndex}-${timeIndex}`]);

        timeSlots.forEach((_, timeIndex) => {
            const key = `${dayIndex}-${timeIndex}`;
            newSelectedSlots[key] = !allSelected;
        });

        setSelectedSlots(newSelectedSlots);
    };

    const handleSaveSchedule = () => {
        // Tạo mảng chứa lịch làm việc đã chọn
        const scheduleData = weekDays.map((day, dayIndex) => {
            const daySlots = timeSlots.map(time => {
                const slotKey = `${dayIndex}-${time}`;
                return {
                    time,
                    isSelected: selectedSlots[slotKey] || false
                };
            });
            return {
                dayIndex,
                day,
                slots: daySlots
            };
        });

        console.log('Dữ liệu lịch làm việc:', scheduleData);
        // TODO: Gọi API để lưu lịch làm việc
        setShowScheduleModal(false);
        showNotification('Lưu lịch làm việc thành công', 'success');
    };

    useEffect(() => {
        const checkAccess = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userData);
            if (user.role !== 'DOCTOR') {
                showNotification('Bạn không có quyền truy cập trang này!', 'error');
                navigate('/home');
                return;
            }

            // Sử dụng thông tin từ localStorage
            setDoctor({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                avatarUrl: user.avatarUrl,
                address: user.address,
                about: user.about,
                specialization_name: user.specialization_name,
                yearsOfExperience: user.yearsOfExperience,
                hospital: {
                    id: user.hospital_id,
                    name: user.hospital_name,
                    address: user.hospital_address || ''
                }
            });
            setIsLoading(false);
        };

        checkAccess();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'appointments':
                return <div className="doctor-content">Quản lý lịch hẹn</div>;
            case 'profile':
                return (
                    <div className="doctor-content">
                        <div className="profile-container">
                            <h2>Thông tin cá nhân</h2>
                            <div className="profile-info">
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        <img src={doctor?.avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" />
                                    </div>
                                    <div className="profile-name">
                                        <h3>{doctor?.name}</h3>
                                        <p className="specialization">{doctor?.specialization_name}</p>
                                    </div>
                                </div>
                                <div className="profile-details">
                                    <div className="detail-group">
                                        <label>Email:</label>
                                        <span>{doctor?.email}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Số điện thoại:</label>
                                        <span>{doctor?.phone}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Giới tính:</label>
                                        <span>{doctor?.gender === 'MALE' ? 'Nam' : doctor?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Ngày sinh:</label>
                                        <span>{doctor?.dateOfBirth ? new Date(doctor.dateOfBirth).toLocaleDateString('vi-VN') : ''}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Địa chỉ:</label>
                                        <span>{doctor?.address}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Năm kinh nghiệm:</label>
                                        <span>{doctor?.yearsOfExperience} năm</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Bệnh viện:</label>
                                        <span>{doctor?.hospital?.name}</span>
                                    </div>
                                    <div className="detail-group">
                                        <label>Địa chỉ bệnh viện:</label>
                                        <span>{doctor?.hospital?.address}</span>
                                    </div>
                                    <div className="detail-group full-width">
                                        <label>Giới thiệu:</label>
                                        <p className="about-text">{doctor?.about}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'schedule':
                return (
                    <div className="doctor-content">
                        <div className="schedule-container">
                            <button
                                className="schedule-button"
                                onClick={() => setShowScheduleModal(true)}
                            >
                                Đăng ký lịch làm việc
                            </button>

                            {showScheduleModal && (
                                <div className="modal-overlay">
                                    <div className="schedule-modal">
                                        <div className="modal-header">
                                            <h2>Đăng ký lịch làm việc</h2>
                                            <button
                                                className="close-button"
                                                onClick={() => setShowScheduleModal(false)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="schedule-table-container">
                                                <table className="schedule-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Giờ</th>
                                                            {weekDays.map((day, index) => (
                                                                <th key={index}>{day}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {timeSlots.map((time, timeIndex) => (
                                                            <tr key={timeIndex}>
                                                                <td className="time-slot">{time}</td>
                                                                {weekDays.map((_, dayIndex) => (
                                                                    <td
                                                                        key={dayIndex}
                                                                        className={selectedSlots[`${dayIndex}-${timeIndex}`] ? 'selected' : ''}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            className="schedule-checkbox"
                                                                            id={`${dayIndex}-${timeIndex}`}
                                                                            checked={selectedSlots[`${dayIndex}-${timeIndex}`] || false}
                                                                            onChange={() => handleSlotChange(dayIndex, timeIndex)}
                                                                        />
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                        <tr className="select-all-row">
                                                            <td className="time-slot">Tất cả</td>
                                                            {weekDays.map((_, dayIndex) => (
                                                                <td key={dayIndex}>
                                                                    <button
                                                                        className="select-all-button"
                                                                        onClick={() => handleSelectAllDay(dayIndex)}
                                                                    >
                                                                        Chọn tất cả
                                                                    </button>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    className="cancel-button"
                                                    onClick={() => setShowScheduleModal(false)}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    className="submit-button"
                                                    onClick={handleSaveSchedule}
                                                >
                                                    Lưu lịch
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return <div className="doctor-content">Quản lý lịch hẹn</div>;
        }
    };

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="doctor-page">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-content">
                    <div className="logo">
                        <img src={logoImage} alt="Lofi Pharma" />
                        <span>Lofi Pharma</span>
                    </div>
                    <div className="user-greeting">
                        <span>Xin chào, {doctor?.name}!</span>
                        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                    </div>
                </div>
            </div>

            {/* Doctor Content */}
            <div className="doctor-container">
                {/* Sidebar */}
                <div className="doctor-sidebar">
                    <div className="sidebar-header">
                        <h2>Quản lý bác sĩ</h2>
                    </div>
                    <ul className="sidebar-menu">
                        <li>
                            <button
                                className={activeTab === 'appointments' ? 'active' : ''}
                                onClick={() => setActiveTab('appointments')}
                            >
                                <span className="icon">📅</span>
                                Quản lý lịch hẹn
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'profile' ? 'active' : ''}
                                onClick={() => setActiveTab('profile')}
                            >
                                <span className="icon">👤</span>
                                Thông tin cá nhân
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'schedule' ? 'active' : ''}
                                onClick={() => setActiveTab('schedule')}
                            >
                                <span className="icon">📋</span>
                                Lịch làm việc
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="doctor-main">
                    {renderContent()}
                </div>
            </div>

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Doctor; 