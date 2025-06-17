import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import axios from '../config/axios';
import '../styles/DoctorDetail.css';
import stompClient from '../config/stomp';
import { doctorResponse } from '../types/api';

interface Schedule {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available: boolean;
}

const DoctorDetail: React.FC = () => {
    const { hospitalId, doctorId } = useParams<{ hospitalId: string; doctorId: string }>();
    const [doctor, setDoctor] = useState<doctorResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [reason, setReason] = useState<string>('');
    const navigate = useNavigate();

    // Tạo mảng 7 ngày tiếp theo
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1); // Bắt đầu từ ngày mai
        return date;
    });

    // Format date thành string để hiển thị
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
                    const doctors = await doctorService.getDoctorsByHospital(parseInt(hospitalId));
                    // console.log('Danh sách bác sĩ:', doctors);
                    // console.log('ID bác sĩ cần tìm:', doctorId);

                    // Chuyển đổi doctorId sang number để so sánh
                    const doctorIdNum = parseInt(doctorId || '0');
                    const foundDoctor = doctors.find(d => d.id === doctorIdNum);

                    console.log('Bác sĩ tìm thấy:', foundDoctor);
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

    // Tách hàm fetchSchedules ra để có thể tái sử dụng
    const fetchSchedules = async () => {
        try {
            if (doctorId) {
                const response = await axios.get(`/schedule/getSchedulesWithAvailability?doctor_id=${doctorId}`);
                console.log(response.data);
                setSchedules(response.data);
            }
        } catch (err) {
            console.error('Error fetching schedules:', err);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [doctorId]);

    // Thêm useEffect để xử lý WebSocket
    useEffect(() => {
        // Kết nối WebSocket
        stompClient.onConnect = () => {
            console.log('Connected to WebSocket');
            // Subscribe vào topic để nhận thông báo
            stompClient.subscribe('/topic/slot-booked', (message) => {
                const data = JSON.parse(message.body);
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;

                // Kiểm tra nếu slot đang được chọn bị người khác đặt
                if (selectedDate && selectedTime && doctorId && user) {
                    const [startTime] = selectedTime.split(' - ');

                    // Chỉ hiển thị thông báo nếu không phải do chính mình đặt
                    if (
                        parseInt(doctorId) === data.doctorId &&
                        selectedDate === data.date &&
                        startTime === data.startTime.slice(0, 5) &&
                        user.id !== data.patientId
                    ) {
                        alert('⚠️ Khung giờ bạn đang chọn đã bị người khác đặt rồi!');
                        setSelectedTime('');
                        // Load lại dữ liệu sau khi nhận thông báo
                        fetchSchedules();
                    }
                }

                // Cập nhật lại danh sách lịch khi có người đặt
                if (parseInt(doctorId || '0') === data.doctorId) {
                    fetchSchedules();
                }
            });
        };

        // Kết nối WebSocket
        stompClient.activate();

        // Cleanup khi component unmount
        return () => {
            stompClient.deactivate();
        };
    }, [selectedDate, selectedTime, doctorId]);

    const handleDateSelect = (date: Date) => {
        // Format date thành YYYY-MM-DD mà không bị ảnh hưởng bởi múi giờ
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        setSelectedDate(formattedDate);
        setSelectedTime(''); // Reset time khi chọn ngày mới
    };

    const handleTimeSelect = (time: string) => {
        // Kiểm tra lại một lần nữa trước khi cho phép chọn
        if (selectedDate && isTimeSlotAvailable(selectedDate, time)) {
            // Kiểm tra xem khung giờ này có bị người khác đặt không
            const [startTime] = time.split(' - ');
            const isBooked = schedules.some(s =>
                s.dayOfWeek === getDayOfWeek(new Date(selectedDate)) &&
                s.startTime.startsWith(startTime) &&
                !s.available
            );

            if (isBooked) {
                alert('⚠️ Khung giờ này đã được người khác đặt!');
                return;
            }

            setSelectedTime(time);
        }
    };

    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    const isTimeSlotAvailable = (dateStr: string, timeRange: string) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        const date = new Date(year, month - 1, day + 1);

        const dayOfWeek = dayNames[date.getUTCDay()]; // Convert số → tên thứ
        const [startTime] = timeRange.split(" - ");

        const schedule = schedules.find(s =>
            s.dayOfWeek === dayOfWeek &&
            s.startTime.startsWith(startTime)
        );

        // Không chỉ kiểm tra available mà còn kiểm tra xem có bị người khác đặt không
        return schedule ? schedule.available : false;
    };

    const handleSubmit = async () => {
        try {
            if (!selectedDate || !selectedTime || !reason || !doctorId) {
                return;
            }

            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert('Vui lòng đăng nhập để đặt lịch');
                return;
            }

            const user = JSON.parse(userStr);
            const [startTime] = selectedTime.split(' - ');
            const endTime = selectedTime.split(' - ')[1];

            const appointmentData = {
                patient_id: user.id,
                doctor_id: parseInt(doctorId),
                appointmentDate: selectedDate,
                startTime: `${startTime}:00`,
                endTime: `${endTime}:00`,
                description: reason
            };

            const response = await axios.post('/appointment/createAppointment', appointmentData);

            if (response.status === 200) {
                // Gửi thông báo qua WebSocket khi đặt lịch thành công
                stompClient.publish({
                    destination: '/app/slot-booked',
                    body: JSON.stringify({
                        doctorId: parseInt(doctorId),
                        date: selectedDate,
                        startTime: startTime,
                        message: 'Khung giờ đã được người khác đặt',
                        // patientId: user.id // Thêm patientId vào message
                    })
                });

                alert('Đặt lịch thành công!');
                navigate(-1); // Navigate back after successful appointment
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.');
        }
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
                            <textarea style={{marginBottom: '20px'}} rows={4} placeholder="Nhập lý do khám của bạn..." value={reason} onChange={(e) => setReason(e.target.value)}></textarea>
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
                        {next7Days.map((date, index) => {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const dateString = `${year}-${month}-${day}`;

                            return (
                                <div
                                    key={index}
                                    className={`day-card ${selectedDate === dateString ? 'selected' : ''}`}
                                    onClick={() => handleDateSelect(date)}
                                >
                                    <div className="day-header">
                                        {date.toLocaleDateString('vi-VN', { weekday: 'long' }).replace('Thứ', 'Thứ')}, ngày {date.getDate()}
                                    </div>
                                    <div className="month-name">{date.toLocaleDateString('vi-VN', { month: 'long' })}</div>
                                </div>
                            );
                        })}
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