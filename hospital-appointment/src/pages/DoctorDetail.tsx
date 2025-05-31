import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Doctor, getDoctorsByHospital } from '../services/doctorService';
import axios from '../config/axios';
import '../styles/DoctorDetail.css';

interface Schedule {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available: boolean;
}

const DoctorDetail: React.FC = () => {
    const { hospitalId, doctorId } = useParams<{ hospitalId: string; doctorId: string }>();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const navigate = useNavigate();

    // Tạo mảng 7 ngày tiếp theo
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1); // Bắt đầu từ ngày mai
        return date;
    });

    // Format date thành string
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Chuyển đổi tên thứ từ tiếng Việt sang tiếng Anh
    const getDayOfWeek = (date: Date): string => {
        const days = {
            'Chủ Nhật': 'SUNDAY',
            'Thứ 2': 'MONDAY',
            'Thứ 3': 'TUESDAY',
            'Thứ 4': 'WEDNESDAY',
            'Thứ 5': 'THURSDAY',
            'Thứ 6': 'FRIDAY',
            'Thứ 7': 'SATURDAY'
        };
        const dayName = date.toLocaleDateString('vi-VN', { weekday: 'long' });
        return days[dayName as keyof typeof days] || '';
    };

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                if (hospitalId) {
                    const doctors = await getDoctorsByHospital(parseInt(hospitalId));
                    const foundDoctor = doctors.find(d => d.id === parseInt(doctorId || '0'));
                    if (foundDoctor) {
                        setDoctor(foundDoctor);
                    } else {
                        setError('Không tìm thấy thông tin bác sĩ');
                    }
                }
            } catch (err) {
                setError('Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [hospitalId, doctorId]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (doctorId) {
                    const response = await axios.get(`/schedule/getSchedule?doctor_id=${doctorId}`);
                    console.log(response.data);
                    setSchedules(response.data);
                }
            } catch (err) {
                console.error('Error fetching schedules:', err);
            }
        };

        fetchSchedules();
    }, [doctorId]);

    const handleDateSelect = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
        setSelectedTime(''); // Reset time khi chọn ngày mới
    };

    const handleTimeSelect = (time: string) => {
        // Kiểm tra lại một lần nữa trước khi cho phép chọn
        if (selectedDate && isTimeSlotAvailable(selectedDate, time)) {
            setSelectedTime(time);
        }
    };

    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    const isTimeSlotAvailable = (dateStr: string, timeRange: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day + 1);

        const dayOfWeek = dayNames[date.getDay()]; // Convert số → tên thứ
        const [startTime] = timeRange.split(" - ");
        console.log(dayOfWeek);
        const schedule = schedules.find(s =>
            s.dayOfWeek === dayOfWeek &&
            s.startTime.startsWith(startTime)
        );

        return schedule ? schedule.available : false;
    };

    if (loading) {
        return <div className="loading">Đang tải thông tin bác sĩ...</div>;
    }

    if (error || !doctor) {
        return <div className="error">{error || 'Không tìm thấy thông tin bác sĩ'}</div>;
    }

    return (
        <div className="doctor-detail">
            <div className="doctor-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
                <h1>Thông tin chi tiết bác sĩ</h1>
            </div>

            <div className="doctor-content">
                <div className="doctor-info-section">
                    <div className="doctor-profile">
                        <div className="doctor-avatar-large">
                            <span>{doctor.name.charAt(0)}</span>
                        </div>
                        <div className="doctor-info">
                            <h2>{doctor.name}</h2>
                            <p className="specialization">Khoa: {doctor.specialization_name}</p>
                            <p className="experience">Kinh nghiệm: {doctor.yearsOfExperience} năm</p>
                            <p className="gender">Giới tính: {doctor.gender}</p>
                            <p className="dateOfBirth">Ngày sinh: {doctor.dateOfBirth}</p>
                            <p className="email">Email: {doctor.email}</p>
                            <p className="phone">SDT: {doctor.phone}</p>
                            <p className="about">Mô tả: {doctor.about}</p>
                        </div>
                    </div>

                    <div className="appointment-details">
                        <h3>Thông tin đặt lịch</h3>
                        {selectedDate && (
                            <div className="selected-info">
                                <p>Ngày đã chọn: {formatDate(new Date(selectedDate))}</p>
                                {selectedTime && <p>Giờ đã chọn: {selectedTime}</p>}
                            </div>
                        )}
                        <div className="form-group">
                            <label>Lý do khám:</label>
                            <textarea rows={4} placeholder="Nhập lý do khám của bạn..." value={reason} onChange={(e) => setReason(e.target.value)}></textarea>
                        </div>
                        <button
                            className="submit-button"
                            disabled={!selectedDate || !selectedTime || !reason || !doctorId}
                            onClick={handleSubmit}
                        >
                            Xác nhận đặt lịch
                        </button>
                    </div>
                </div>

                <div className="schedule-section">
                    <h3>Lịch khám 7 ngày tới</h3>
                    <div className="days-grid">
                        {next7Days.map((date, index) => (
                            <div
                                key={index}
                                className={`day-card ${selectedDate === date.toISOString().split('T')[0] ? 'selected' : ''}`}
                                onClick={() => handleDateSelect(date)}
                            >
                                <div className="day-header">
                                    {date.toLocaleDateString('vi-VN', { weekday: 'long' }).replace('Thứ', 'Thứ')}, ngày {date.getDate()}
                                </div>
                                <div className="month-name">{date.toLocaleDateString('vi-VN', { month: 'long' })}</div>
                            </div>
                        ))}
                    </div>

                    {selectedDate && (
                        <div className="time-slots-container">
                            <h4>Chọn giờ khám</h4>
                            <div className="time-slots">
                                {[
                                    '08:00 - 09:00',
                                    '09:00 - 10:00',
                                    '10:00 - 11:00',
                                    '11:00 - 12:00',
                                    '13:00 - 14:00',
                                    '14:00 - 15:00',
                                    '15:00 - 16:00',
                                    '16:00 - 17:00'
                                ].map((time) => {
                                    const isAvailable = isTimeSlotAvailable(selectedDate, time);
                                    return (
                                        <button
                                            key={time}
                                            className={`time-slot ${selectedTime === time ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                                            onClick={() => handleTimeSelect(time)}
                                            disabled={!isAvailable}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDetail; 