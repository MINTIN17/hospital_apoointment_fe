import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Doctor, getDoctorsByHospital } from '../services/doctorService';
import '../styles/DoctorList.css';

const DoctorList: React.FC = () => {
    const { hospitalId } = useParams<{ hospitalId: string }>();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                if (hospitalId) {
                    const data = await getDoctorsByHospital(parseInt(hospitalId));
                    setDoctors(data);
                }
            } catch (err) {
                setError('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [hospitalId]);

    const handleBookAppointment = (doctorId: number) => {
        navigate(`/hospitals/${hospitalId}/doctors/${doctorId}`);
    };

    if (loading) {
        return <div className="loading">Đang tải danh sách bác sĩ...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="doctor-list">
            <h2>Danh sách bác sĩ</h2>
            <div className="doctor-grid">
                {doctors.map((doctor) => (
                    <div key={doctor.id} className="doctor-card">
                        <div className="doctor-avatar">
                            {/* Có thể thêm ảnh đại diện bác sĩ ở đây */}
                            <span>{doctor.name.charAt(0)}</span>
                        </div>
                        <div className="doctor-info">
                            <h3>{doctor.name}</h3>
                            <p className="specialization">Khoa: {doctor.specialization_name}</p>
                            <p className="experience">Kinh nghiệm: {doctor.yearsOfExperience} năm</p>
                            <button
                                className="book-button"
                                onClick={() => handleBookAppointment(doctor.id)}
                            >
                                Đặt lịch
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorList; 