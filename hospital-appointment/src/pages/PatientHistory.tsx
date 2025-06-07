import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/PatientHistory.css';
import logoImage from '../assets/logo.png';
import { Appointment } from '../types/api';
import { colors } from '@mui/material';


const PatientHistory: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 5;

    // Hàm lấy danh sách cuộc hẹn của bệnh nhân
    const fetchPatientAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (!token || !userStr) {
                console.log('Không tìm thấy thông tin người dùng');
                return;
            }

            const user = JSON.parse(userStr);
            if (user.role !== 'PATIENT') {
                console.log('Người dùng không phải là bệnh nhân');
                return;
            }

            const response = await axios.get(
                `http://localhost:8801/api/appointment/getPatientAppointment?patient_id=${user.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setAppointments(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching patient appointments:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientAppointments();
    }, []);

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

    // Hàm format ngày giờ
    const formatDateTime = (date: string, time: string) => {
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString('vi-VN')} ${time.slice(0, 5)}`;
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

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="patient-history-page">
            <div className="patient-history-container">
                <div className="patient-history-main">
                    <div className="history-section">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2>Lịch sử khám bệnh</h2>

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
                                        color: '#000000'
                                    }}>Ngày:</label>
                                    <input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid #1a237e',
                                            color: '#000000',
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
                                        color: '#000000'
                                    }}>Trạng thái:</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid #1a237e',
                                            color: '#000000',
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

                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Bác sĩ</th>
                                        <th>Lý do khám</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAppointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td style={{ color: '#000000' }}>
                                                {formatDateTime(appointment.appointmentDate, appointment.startTime)}
                                            </td>
                                            <td style={{ color: '#000000' }}>
                                                {appointment.doctor_name}
                                            </td>
                                            <td style={{ color: '#000000' }}>
                                                {appointment.description}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                                                    {getStatusText(appointment.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentAppointments.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="empty-state">
                                                Không có lịch sử khám bệnh
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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
                                        backgroundColor: currentPage === 1 ? '#e9ecef' : '#1a237e',
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
                                                backgroundColor: currentPage === number ? '#1a237e' : '#e9ecef',
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
                                        backgroundColor: currentPage === totalPages ? '#e9ecef' : '#1a237e',
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
                </div>
            </div>
        </div>
    );
};

export default PatientHistory; 