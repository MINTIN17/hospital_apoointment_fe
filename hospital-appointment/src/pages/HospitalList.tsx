import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HospitalList.css';
import { hospitalService } from '../services/hospitalService';
import { Hospital } from '../types/api';
import { FaSearch } from 'react-icons/fa';

const HospitalList: React.FC = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const data = await hospitalService.getAllHospitals();
                const enabledHospitals = data.filter(hospital => hospital.enabled);
                setHospitals(enabledHospitals);
                setFilteredHospitals(enabledHospitals);
                setError(null);
            } catch (err) {
                setError('Failed to fetch hospitals');
                console.error('Error fetching hospitals:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHospitals();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredHospitals(hospitals);
        } else {
            const filtered = hospitals.filter(hospital =>
                hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredHospitals(filtered);
        }
    }, [searchTerm, hospitals]);

    const handleBookAppointment = (hospitalId: number) => {
        navigate(`/doctorList/${hospitalId}`);
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="hospital-list-container">
            <h1 className="page-title">Danh sách bệnh viện</h1>
            <div className="search-container">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bệnh viện..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>
            <div className="hospital-grid">
                {filteredHospitals.map((hospital) => (
                    <div key={hospital.id} className="hospital-card">
                        <div className="hospital-image">
                            <img src={hospital.avatarUrl} alt={hospital.name} />
                        </div>
                        <div className="hospital-info">
                            <h2 className="hospital-name">{hospital.name}</h2>

                            <p className="hospital-address">
                                Địa chỉ:
                                <i className="fas fa-map-marker-alt"></i> {hospital.address}
                            </p>
                            <p className="hospital-phone">
                                Số điện thoại:
                                <i className="fas fa-phone"></i> {hospital.phone}
                            </p>
                            <button
                                className="book-appointment-btn"
                                onClick={() => handleBookAppointment(hospital.id)}
                            >
                                Đặt lịch khám
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HospitalList; 