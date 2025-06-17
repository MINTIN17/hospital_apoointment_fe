import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { specializationService } from '../services/specializationService';
import { FaSearch } from 'react-icons/fa';
import '../styles/DoctorList.css';
import { doctorResponse } from '../types/api';
interface Specialization {
    id: number;
    name: string;
}

const DoctorList: React.FC = () => {
    const { hospitalId } = useParams<{ hospitalId: string }>();
    const [doctors, setDoctors] = useState<doctorResponse[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<doctorResponse[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (hospitalId) {
                    const [doctorsData, specializationsData] = await Promise.all([
                        doctorService.getDoctorsByHospital(parseInt(hospitalId)),
                        specializationService.getAllSpecializations(hospitalId)
                    ]);
                    setDoctors(doctorsData);
                    setFilteredDoctors(doctorsData);
                    setSpecializations(specializationsData);
                }
            } catch (err) {
                setError('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [hospitalId]);

    useEffect(() => {
        let filtered = doctors;

        // Lọc theo tên hoặc số điện thoại
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(doctor =>
                doctor.name.toLowerCase().includes(searchLower) ||
                doctor.phone.includes(searchTerm)
            );
        }

        // Lọc theo chuyên khoa
        if (selectedSpecialization) {
            filtered = filtered.filter(doctor =>
                doctor.specialization_name === selectedSpecialization
            );
        }

        setFilteredDoctors(filtered);
    }, [searchTerm, selectedSpecialization, doctors]);

    const handleBookAppointment = (doctorId: string) => {
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
            <div className="search-filter-container">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <select
                    className="specialization-select"
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                >
                    <option value="">Tất cả chuyên khoa</option>
                    {specializations.map((spec) => (
                        <option key={spec.id} value={spec.name}>
                            {spec.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="doctor-grid">
                {filteredDoctors
                    .filter(doctor => doctor.enabled)
                    .map((doctor) => (
                        <div key={doctor.id} className="doctor-card">
                            <div className="doctor-avatar">
                                {doctor.avatarUrl ? (
                                    <img src={doctor.avatarUrl} alt={doctor.name} />
                                ) : (
                                    doctor.name.charAt(0)
                                )}
                            </div>
                            <div className="doctor-info">
                                <h3>{doctor.name}</h3>
                                <p className="specialization">Khoa: {doctor.specialization_name}</p>
                                <p className="experience">Kinh nghiệm: {doctor.yearsOfExperience} năm</p>
                                <button
                                    className="book-button"
                                    onClick={() => handleBookAppointment(doctor.id.toString())}
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