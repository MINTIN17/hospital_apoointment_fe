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

interface Schedule {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available: boolean;
}

interface Appointment {
    id: number;
    patient_id: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    appointmentDate: string;
    startTime: string;
    endTime: string;
    description: string;
}

const Doctor: React.FC = () => {
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [activeTab, setActiveTab] = useState('appointments');
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<{ [key: string]: boolean }>({});
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [scheduleMap, setScheduleMap] = useState<Map<string, boolean>>(new Map());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 5;

    // Tạo mảng các ngày trong tuần
    const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    // Tạo mảng các khung giờ
    const timeSlots = Array.from({ length: 9 }, (_, i) => {
        const hour = i + 8; // Từ 8h đến 16h
        const nextHour = hour + 1;
        const timeSlot = `${hour}:00-${nextHour}:00`;
        return timeSlot;
    });

    const handleSlotChange = (dayIndex: number, timeIndex: number) => {
        const dayOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][dayIndex];
        const time = timeSlots[timeIndex];
        const [startTime] = time.split('-');
        const formattedStartTime = `${parseInt(startTime)}:00:00`;
        const key = `${dayOfWeek}-${formattedStartTime}`;

        const newScheduleMap = new Map(scheduleMap);
        newScheduleMap.set(key, !scheduleMap.get(key));
        setScheduleMap(newScheduleMap);
    };

    const handleSelectAllDay = (dayIndex: number) => {
        const dayOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][dayIndex];
        const newScheduleMap = new Map(scheduleMap);

        // Kiểm tra xem tất cả các khung giờ của ngày đó đã được chọn chưa
        const allSelected = timeSlots.every(time => {
            const [startTime] = time.split('-');
            const formattedStartTime = `${parseInt(startTime)}:00:00`;
            const key = `${dayOfWeek}-${formattedStartTime}`;
            return newScheduleMap.get(key);
        });

        // Nếu tất cả đã được chọn thì bỏ chọn tất cả, ngược lại thì chọn tất cả
        timeSlots.forEach(time => {
            const [startTime] = time.split('-');
            const formattedStartTime = `${parseInt(startTime)}:00:00`;
            const key = `${dayOfWeek}-${formattedStartTime}`;
            newScheduleMap.set(key, !allSelected);
        });

        setScheduleMap(newScheduleMap);
    };

    const handleSaveSchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !doctor) {
                showNotification('Vui lòng đăng nhập lại', 'error');
                return;
            }

            // Tạo mảng chứa các lịch làm việc đã thay đổi
            const changedSchedules: { id: number; available: boolean }[] = [];

            // Duyệt qua tất cả các lịch hiện tại
            schedules.forEach(schedule => {
                const hour = schedule.startTime.split(':')[0];
                const formattedTime = `${parseInt(hour)}:00:00`;
                const key = `${schedule.dayOfWeek}-${formattedTime}`;
                const newAvailable = scheduleMap.get(key) || false;

                // Nếu trạng thái available thay đổi
                if (schedule.available !== newAvailable) {
                    changedSchedules.push({
                        id: schedule.id,
                        available: newAvailable
                    });
                }
            });

            // Gọi API để cập nhật trạng thái với token trong header
            const response = await axios.put(
                'http://localhost:8801/api/schedule/availability',
                changedSchedules,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                setShowScheduleModal(false);
                showNotification('Lưu lịch làm việc thành công', 'success');

                // Refresh lại danh sách lịch với token
                const updatedSchedules = await axios.get(
                    `http://localhost:8801/api/schedule/getSchedule?doctor_id=${doctor.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setSchedules(updatedSchedules.data);

                // Trả về mảng các lịch đã thay đổi
                return changedSchedules;
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            showNotification('Không thể lưu lịch làm việc', 'error');
            return [];
        }
    };

    // Hàm lấy danh sách cuộc hẹn của bác sĩ
    const fetchDoctorAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (!token || !userStr) {
                console.log('Không tìm thấy thông tin người dùng');
                return;
            }

            const user = JSON.parse(userStr);
            if (user.role !== 'DOCTOR') {
                console.log('Người dùng không phải là bác sĩ');
                return;
            }

            const response = await axios.get(`http://localhost:8801/api/appointment/getDoctorAppointment?doctor_id=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Doctor appointments:', response.data);
            setAppointments(response.data);
        } catch (err) {
            console.error('Error fetching doctor appointments:', err);
            showNotification('Không thể tải danh sách cuộc hẹn', 'error');
        }
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

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !doctor) return;

                const response = await axios.get(
                    `http://localhost:8801/api/schedule/getSchedule?doctor_id=${doctor.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log('Dữ liệu lịch từ API:', response.data);
                setSchedules(response.data);

                // Tạo Map để lưu trữ lịch
                const newScheduleMap = new Map();
                response.data.forEach((schedule: Schedule) => {
                    const hour = schedule.startTime.split(':')[0];
                    const formattedTime = `${parseInt(hour)}:00:00`;
                    const key = `${schedule.dayOfWeek}-${formattedTime}`;
                    console.log(key);
                    newScheduleMap.set(key, schedule.available);
                });
                setScheduleMap(newScheduleMap);
            } catch (error) {
                console.error('Error fetching schedules:', error);
                showNotification('Không thể tải lịch làm việc', 'error');
            }
        };

        if (doctor) {
            fetchSchedules();
        }
    }, [doctor]);

    // Gọi API lấy danh sách cuộc hẹn khi component mount
    useEffect(() => {
        fetchDoctorAppointments();
    }, []);

    // Hàm xử lý thay đổi trạng thái cuộc hẹn
    const handleAppointmentStatus = async (appointmentId: number, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Vui lòng đăng nhập lại', 'error');
                return;
            }

            let response;
            let successMessage = '';
            switch (newStatus) {
                case 'CONFIRMED':
                    response = await axios.put(
                        `http://localhost:8801/api/appointment/confirmAppointment?appointment_id=${appointmentId}`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    successMessage = 'Đã xác nhận cuộc hẹn';
                    break;
                case 'CANCELLED':
                    response = await axios.put(
                        `http://localhost:8801/api/appointment/cancelAppointment?appointment_id=${appointmentId}`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    successMessage = 'Đã hủy cuộc hẹn';
                    break;
                case 'COMPLETED':
                    response = await axios.put(
                        `http://localhost:8801/api/appointment/completeAppointment?appointment_id=${appointmentId}`,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    successMessage = 'Đã hoàn thành cuộc hẹn';
                    break;
            }

            if (response.status === 200) {
                showNotification(successMessage, 'success');
                // Load lại danh sách cuộc hẹn
                fetchDoctorAppointments();
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            showNotification('Không thể cập nhật trạng thái', 'error');
        }
    };

    // Hàm hiển thị thông báo
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    // Hàm format ngày giờ
    const formatDateTime = (date: string, time: string) => {
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('vi-VN')} ${time.slice(0, 5)}`;
    };

    // Hàm lấy màu sắc cho trạng thái
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Hàm chuyển đổi trạng thái sang tiếng Việt
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'COMPLETED':
                return 'Đã hoàn thành';
            default:
                return status;
        }
    };

    // Hàm lọc cuộc hẹn
    const filteredAppointments = appointments.filter(appointment => {
        const matchesDate = !filterDate || appointment.appointmentDate === filterDate;
        const matchesStatus = filterStatus === 'ALL' || appointment.status === filterStatus;
        return matchesDate && matchesStatus;
    });

    // Tính toán phân trang
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

    // Reset về trang 1 khi thay đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [filterDate, filterStatus]);

    const renderContent = () => {
        switch (activeTab) {
            case 'appointments':
                return (
                    <div className="doctor-main">
                        <div className="appointments-section">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2>Danh sách cuộc hẹn</h2>

                                {/* Filter Section */}
                                <div className="filter-section" style={{
                                    display: 'flex',
                                    gap: '20px',
                                    alignItems: 'center'
                                }}>
                                    <div className="filter-group">
                                        <label style={{
                                            marginRight: '10px',
                                            fontWeight: '500',
                                            color: '#1a237e'
                                        }}>Ngày:</label>
                                        <input
                                            type="date"
                                            value={filterDate}
                                            onChange={(e) => setFilterDate(e.target.value)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                border: '1px solid #1a237e',
                                                color: '#1a237e',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label style={{
                                            marginRight: '10px',
                                            fontWeight: '500',
                                            color: '#1a237e'
                                        }}>Trạng thái:</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                border: '1px solid #1a237e',
                                                color: '#1a237e',
                                                backgroundColor: 'white',
                                                minWidth: '150px',
                                                cursor: 'pointer',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="ALL">Tất cả</option>
                                            <option value="PENDING">Chờ xác nhận</option>
                                            <option value="CONFIRMED">Đã xác nhận</option>
                                            <option value="CANCELLED">Đã hủy</option>
                                            <option value="COMPLETED">Đã hoàn thành</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFilterDate('');
                                            setFilterStatus('ALL');
                                        }}
                                        style={{
                                            padding: '8px 10px',
                                            backgroundColor: '#1a237e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#283593';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1a237e';
                                        }}
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            </div>

                            <div className="appointments-table-container">
                                <table className="appointments-table">
                                    <thead>
                                        <tr>
                                            <th>Thời gian</th>
                                            <th>Lý do khám</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentAppointments.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td>
                                                    {formatDateTime(appointment.appointmentDate, appointment.startTime)}
                                                </td>
                                                <td>
                                                    {appointment.description}
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                                        {getStatusText(appointment.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {appointment.status === 'PENDING' && (
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleAppointmentStatus(appointment.id, 'CONFIRMED')}
                                                                className="action-button button-confirm"
                                                            >
                                                                Xác nhận
                                                            </button>
                                                            <button
                                                                onClick={() => handleAppointmentStatus(appointment.id, 'CANCELLED')}
                                                                className="action-button button-cancel"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    )}
                                                    {appointment.status === 'CONFIRMED' && (
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleAppointmentStatus(appointment.id, 'COMPLETED')}
                                                                className="action-button button-complete"
                                                            >
                                                                Hoàn thành
                                                            </button>
                                                        </div>
                                                    )}
                                                    {appointment.status === 'COMPLETED' && (
                                                        <div className="action-buttons">
                                                            <span className="status-badge status-completed">
                                                                Đã hoàn thành
                                                            </span>
                                                        </div>
                                                    )}
                                                    {appointment.status === 'CANCELLED' && (
                                                        <div className="action-buttons">
                                                            <span className="status-badge status-cancelled">
                                                                Đã hủy
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {currentAppointments.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="empty-state">
                                                    Không có cuộc hẹn nào
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination" style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '20px',
                                position: 'sticky',
                                bottom: 0,
                                backgroundColor: 'white',
                                borderTop: '1px solid #e9ecef'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: currentPage === 1 ? '#e9ecef' : '#007bff',
                                        color: currentPage === 1 ? '#6c757d' : 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Trước
                                </button>
                                <div style={{
                                    display: 'flex',
                                    gap: '5px',
                                    alignItems: 'center'
                                }}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                        <button
                                            key={number}
                                            onClick={() => setCurrentPage(number)}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: currentPage === number ? '#007bff' : '#e9ecef',
                                                color: currentPage === number ? 'white' : '#495057',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: currentPage === totalPages ? '#e9ecef' : '#007bff',
                                        color: currentPage === totalPages ? '#6c757d' : 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'profile':
                return (
                    <div className="doctor-main">
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
                    <div className="doctor-main">
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
                                                            <th>Khung giờ</th>
                                                            {weekDays.map((day, index) => (
                                                                <th key={index}>{day}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {timeSlots.map((time, timeIndex) => (
                                                            <tr key={timeIndex}>
                                                                <td className="time-slot" style={{ color: 'black' }}>{time}</td>
                                                                {weekDays.map((_, dayIndex) => {
                                                                    const dayOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][dayIndex];
                                                                    const [startTime] = time.split('-');
                                                                    const formattedStartTime = `${parseInt(startTime)}:00:00`;
                                                                    const key = `${dayOfWeek}-${formattedStartTime}`;
                                                                    const isSelected = scheduleMap.get(key) || false;

                                                                    return (
                                                                        <td
                                                                            key={dayIndex}
                                                                            className={isSelected ? 'selected' : ''}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                className="schedule-checkbox"
                                                                                id={`${dayIndex}-${timeIndex}`}
                                                                                checked={isSelected}
                                                                                onChange={() => handleSlotChange(dayIndex, timeIndex)}
                                                                            />
                                                                        </td>
                                                                    );
                                                                })}
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
                return <div className="doctor-main">Quản lý lịch hẹn</div>;
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
                        <button onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            navigate('/login', { replace: true });
                        }} className="logout-btn">Đăng xuất</button>
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
                <div className="content">
                    {renderContent()}
                </div>
            </div>

            {notification && (
                <div
                    className={`notification ${notification.type}`}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        height: '50px',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        backgroundColor: notification.type === 'success' ? '#4CAF50' : '#f44336',
                        color: 'white',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        animation: 'slideIn 0.3s ease'
                    }}
                >
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Doctor; 