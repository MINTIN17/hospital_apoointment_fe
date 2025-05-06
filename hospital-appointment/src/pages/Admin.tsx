import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { specializationService } from '../services/api';
import '../styles/Admin.css';
import logoImage from '../assets/logo.png';

interface Hospital {
    id: number;
    avatarUrl: string;
    name: string;
    address: string;
    phone: string;
}

interface Specialization {
    id: number;
    name: string;
    description: string;
}

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    avatarUrl: string;
}

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('patients');
    const [showHospitalModal, setShowHospitalModal] = useState(false);
    const [showHospitalDetailModal, setShowHospitalDetailModal] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hospitalForm, setHospitalForm] = useState({
        name: '',
        address: '',
        phone: '',
        image: null as File | null
    });
    const [showAddSpecializationModal, setShowAddSpecializationModal] = useState(false);
    const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
    const [specializationForm, setSpecializationForm] = useState({
        name: ''
    });
    const [doctorForm, setDoctorForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        experience: '',
        about: '',
        specialization: '',
        image: null as File | null,
        gender: 'MALE',
        dateOfBirth: '',
        address: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSpecializations, setFilteredSpecializations] = useState<Specialization[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const checkAccess = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Nếu có user data trong localStorage thì không phải admin
            const userData = localStorage.getItem('user');
            if (userData) {
                showNotification('Bạn không có quyền truy cập trang này!', 'error');
                navigate('/home');
                return;
            }

            // Nếu chỉ có token và không có user data thì là admin
            // Không cần làm gì cả, cho phép truy cập
        };

        checkAccess();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'hospitals') {
            fetchHospitals();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedHospital) {
            setFilteredSpecializations(specializations);
        }
    }, [specializations, selectedHospital]);

    const fetchHospitals = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8801/api/hospital/getAllHospital', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setHospitals(response.data);
        } catch (error) {
            console.error('Error fetching hospitals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const handleHospitalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append("file", hospitalForm.image!);
            formData.append("upload_preset", "Hospital");
            // Upload ảnh lên Cloudinary
            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/di53bdbjf/image/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log(uploadResponse.data.secure_url);
            // Tạo bệnh viện mới với URL ảnh đã upload
            const hospitalData = {
                avatarUrl: uploadResponse.data.secure_url,
                name: hospitalForm.name,
                address: hospitalForm.address,
                phone: hospitalForm.phone
            };

            await axios.post('http://localhost:8801/api/hospital/add', hospitalData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Đóng modal và reset form
            setShowHospitalModal(false);
            setHospitalForm({ name: '', address: '', phone: '', image: null });

            // Refresh danh sách bệnh viện
            fetchHospitals();
        } catch (error) {
            console.error('Error adding hospital:', error);
            alert('Có lỗi xảy ra khi thêm bệnh viện');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setHospitalForm(prev => ({
                ...prev,
                image: e.target.files![0]
            }));
        }
    };

    const handleHospitalClick = async (hospital: Hospital) => {
        setSelectedHospital(hospital);
        setShowHospitalDetailModal(true);
        try {
            // Gọi API lấy danh sách chuyên khoa
            const specializations = await specializationService.getAllSpecializations(hospital.id.toString());
            console.log('Danh sách chuyên khoa:', specializations);
            setSpecializations(specializations);

            // Tạm thời comment phần API doctor
            /*
            const doctorResponse = await axios.get(`http://localhost:8801/api/doctor/hospital/${hospital.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setDoctors(doctorResponse.data);
            */
        } catch (error) {
            console.error('Error fetching hospital details:', error);
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const resetSpecializationForm = () => {
        setSpecializationForm({ name: '' });
        setSearchTerm('');
    };

    const handleCloseSpecializationModal = () => {
        setShowAddSpecializationModal(false);
        resetSpecializationForm();
    };

    const handleAddSpecialization = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await specializationService.addSpecialization({
                name: specializationForm.name,
                hospital_id: selectedHospital?.id.toString() || ''
            });

            if (response === "success") {
                showNotification('Thêm chuyên khoa thành công', 'success');
                setShowAddSpecializationModal(false);
                resetSpecializationForm();
                // Refresh danh sách chuyên khoa
                if (selectedHospital) {
                    const specializations = await specializationService.getAllSpecializations(selectedHospital.id.toString());
                    setSpecializations(specializations);
                }
            }
        } catch (error: any) {
            console.error('Error adding specialization:', error);
            if (error.response?.data?.message === "Specialization already exists") {
                showNotification('Chuyên khoa này đã tồn tại', 'error');
            } else {
                showNotification('Có lỗi xảy ra khi thêm chuyên khoa', 'error');
            }
        }
    };

    const handleDoctorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDoctorForm(prev => ({
                ...prev,
                image: file
            }));
            // Tạo URL preview cho ảnh
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Vui lòng đăng nhập lại', 'error');
                return;
            }

            if (!doctorForm.image) {
                showNotification('Vui lòng chọn ảnh', 'error');
                return;
            }

            const formData = new FormData();
            formData.append("file", doctorForm.image);
            formData.append("upload_preset", "Hospital");

            // Upload ảnh lên Cloudinary
            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/di53bdbjf/image/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Thêm bác sĩ mới
            const response = await axios.post(
                `http://localhost:8801/api/doctor/add`,
                {
                    registerRequest: {
                        name: doctorForm.name,
                        email: doctorForm.email,
                        password: doctorForm.password,
                        phone: doctorForm.phone,
                        gender: doctorForm.gender,
                        dateOfBirth: doctorForm.dateOfBirth,
                        avatarUrl: uploadResponse.data.secure_url,
                        address: doctorForm.address
                    },
                    about: doctorForm.about,
                    specialization_id: parseInt(doctorForm.specialization),
                    yearsOfExperience: parseInt(doctorForm.experience)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Response:', response.data);

            if (response.data === "success") {
                showNotification('Thêm bác sĩ thành công', 'success');
                setShowAddDoctorModal(false);
                setDoctorForm({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    experience: '',
                    about: '',
                    specialization: '',
                    image: null,
                    gender: 'MALE',
                    dateOfBirth: '',
                    address: ''
                });
                setPreviewImage(null);

                // Refresh danh sách bác sĩ
                if (selectedHospital) {
                    const doctorResponse = await axios.get(`http://localhost:8801/api/doctor/hospital/${selectedHospital.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setDoctors(doctorResponse.data);
                }
            } else {
                showNotification('Có lỗi xảy ra khi thêm bác sĩ', 'error');
            }
        } catch (error: any) {
            console.error('Error adding doctor:', error);
            if (error.response?.data?.message) {
                showNotification(error.response.data.message, 'error');
            } else {
                showNotification('Có lỗi xảy ra khi thêm bác sĩ', 'error');
            }
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTerm(searchTerm);

        if (selectedHospital) {
            if (!searchTerm) {
                setFilteredSpecializations(specializations);
            } else {
                const filtered = specializations.filter(spec =>
                    spec.name.toLowerCase().includes(searchTerm)
                );
                setFilteredSpecializations(filtered);
            }
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'patients':
                return <div className="admin-content">Quản lý bệnh nhân</div>;
            case 'hospitals':
                return (
                    <div className="admin-content">
                        <div className="content-header">
                            <h2>Quản lý bệnh viện</h2>
                            <div className="action-buttons">
                                <button className="add-button" onClick={() => setShowHospitalModal(true)}>
                                    <span className="icon">🏥</span>
                                    Thêm bệnh viện
                                </button>
                            </div>
                        </div>
                        <div className="content-body">
                            {isLoading ? (
                                <div className="loading">Đang tải...</div>
                            ) : (
                                <div className="hospital-grid">
                                    {hospitals.map((hospital) => (
                                        <div
                                            key={hospital.id}
                                            className="hospital-card"
                                            onClick={() => handleHospitalClick(hospital)}
                                        >
                                            <div className="hospital-image">
                                                <img src={hospital.avatarUrl} alt={hospital.name} />
                                            </div>
                                            <div className="hospital-info">
                                                <h3>{hospital.name}</h3>
                                                <p className="hospital-address">
                                                    <span className="icon">📍</span>
                                                    {hospital.address}
                                                </p>
                                                <p className="hospital-phone">
                                                    <span className="icon">📞</span>
                                                    {hospital.phone}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'appointments':
                return <div className="admin-content">Quản lý cuộc hẹn</div>;
            case 'statistics':
                return <div className="admin-content">Thống kê</div>;
            default:
                return <div className="admin-content">Quản lý bệnh nhân</div>;
        }
    };

    return (
        <div className="admin-page">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-content">
                    <div className="logo">
                        <img src={logoImage} alt="Lofi Pharma" />
                        <span>Lofi Pharma</span>
                    </div>
                    <div className="user-greeting">
                        <span>Xin chào, Admin!</span>
                        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                    </div>
                </div>
            </div>

            {/* Admin Content */}
            <div className="admin-container">
                {/* Sidebar */}
                <div className="admin-sidebar">
                    <div className="sidebar-header">
                        <h2>Quản lý hệ thống</h2>
                    </div>
                    <ul className="sidebar-menu">
                        <li>
                            <button
                                className={activeTab === 'patients' ? 'active' : ''}
                                onClick={() => setActiveTab('patients')}
                            >
                                <span className="icon">👥</span>
                                Quản lý bệnh nhân
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'hospitals' ? 'active' : ''}
                                onClick={() => setActiveTab('hospitals')}
                            >
                                <span className="icon">🏥</span>
                                Quản lý bệnh viện
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'appointments' ? 'active' : ''}
                                onClick={() => setActiveTab('appointments')}
                            >
                                <span className="icon">📅</span>
                                Quản lý cuộc hẹn
                            </button>
                        </li>
                        <li>
                            <button
                                className={activeTab === 'statistics' ? 'active' : ''}
                                onClick={() => setActiveTab('statistics')}
                            >
                                <span className="icon">📊</span>
                                Thống kê
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="admin-main">
                    {renderContent()}
                </div>
            </div>

            {/* Modal Thêm Bệnh Viện */}
            {showHospitalModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thêm Bệnh Viện Mới</h3>
                            <button className="close-button" onClick={() => setShowHospitalModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleHospitalSubmit}>
                            <div className="form-group">
                                <label htmlFor="hospitalName">Tên bệnh viện</label>
                                <input
                                    type="text"
                                    id="hospitalName"
                                    value={hospitalForm.name}
                                    onChange={(e) => setHospitalForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    placeholder="Nhập tên bệnh viện"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hospitalAddress">Địa chỉ</label>
                                <input
                                    type="text"
                                    id="hospitalAddress"
                                    value={hospitalForm.address}
                                    onChange={(e) => setHospitalForm(prev => ({ ...prev, address: e.target.value }))}
                                    required
                                    placeholder="Nhập địa chỉ bệnh viện"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hospitalPhone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="hospitalPhone"
                                    value={hospitalForm.phone}
                                    onChange={(e) => setHospitalForm(prev => ({ ...prev, phone: e.target.value }))}
                                    required
                                    placeholder="Nhập số điện thoại bệnh viện"
                                    pattern="[0-9]{10}"
                                    title="Vui lòng nhập số điện thoại 10 chữ số"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="hospitalImage">Ảnh bệnh viện</label>
                                <input
                                    type="file"
                                    id="hospitalImage"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-button" onClick={() => setShowHospitalModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="submit-button">
                                    Thêm bệnh viện
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Chi Tiết Bệnh Viện */}
            {showHospitalDetailModal && selectedHospital && (
                <div className="modal-overlay">
                    <div className="modal-content hospital-detail-modal">
                        <div className="modal-header">
                            <h3>Chi Tiết Bệnh Viện</h3>
                            <button className="close-button" onClick={() => setShowHospitalDetailModal(false)}>×</button>
                        </div>
                        <div className="hospital-detail-content">
                            <div className="hospital-detail-main">
                                <div className="hospital-detail-header">
                                    <img src={selectedHospital.avatarUrl} alt={selectedHospital.name} />
                                    <div className="hospital-detail-info">
                                        <h2>{selectedHospital.name}</h2>
                                        <p><span className="icon">📍</span> {selectedHospital.address}</p>
                                        <p><span className="icon">📞</span> {selectedHospital.phone}</p>
                                    </div>
                                </div>

                                <div className="specializations-section">
                                    <div className="section-header">
                                        <h3>Danh Sách Chuyên Khoa</h3>
                                        <div className="header-actions">
                                            <div className="search-box">
                                                <input
                                                    type="text"
                                                    placeholder="Tìm kiếm chuyên khoa..."
                                                    value={searchTerm}
                                                    onChange={handleSearch}
                                                />
                                                <span className="search-icon">🔍</span>
                                            </div>
                                            <button
                                                className="add-button"
                                                onClick={() => setShowAddSpecializationModal(true)}
                                            >
                                                <span className="icon">➕</span>
                                                Thêm Chuyên Khoa
                                            </button>
                                        </div>
                                    </div>
                                    <div className="specializations-list">
                                        {filteredSpecializations && filteredSpecializations.length > 0 ? (
                                            <table className="specialization-table">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên Chuyên Khoa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredSpecializations.map((spec, index) => (
                                                        <tr key={spec.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{spec.name}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="no-data">Chưa có chuyên khoa nào</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="doctors-section">
                                <div className="section-header">
                                    <h3>Danh Sách Bác Sĩ</h3>
                                    <button
                                        className="add-button"
                                        onClick={() => setShowAddDoctorModal(true)}
                                    >
                                        <span className="icon">➕</span>
                                        Thêm Bác Sĩ
                                    </button>
                                </div>
                                <div className="doctors-grid">
                                    {doctors.map(doctor => (
                                        <div key={doctor.id} className="doctor-card">
                                            <img src={doctor.avatarUrl} alt={doctor.name} />
                                            <div className="doctor-info">
                                                <h4>{doctor.name}</h4>
                                                <p>{doctor.specialization}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Thêm Chuyên Khoa */}
            {showAddSpecializationModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thêm Chuyên Khoa Mới</h3>
                            <button className="close-button" onClick={handleCloseSpecializationModal}>×</button>
                        </div>
                        <form onSubmit={handleAddSpecialization}>
                            <div className="form-group">
                                <label htmlFor="specializationName">Tên chuyên khoa</label>
                                <input
                                    type="text"
                                    id="specializationName"
                                    value={specializationForm.name}
                                    onChange={(e) => setSpecializationForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    placeholder="Nhập tên chuyên khoa"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-button" onClick={handleCloseSpecializationModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="submit-button">
                                    Thêm chuyên khoa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Thêm Bác Sĩ */}
            {showAddDoctorModal && (
                <div className="modal-overlay">
                    <div className="modal-content doctor-modal">
                        <div className="modal-header">
                            <h3>Thêm Bác Sĩ Mới</h3>
                            <button className="close-button" onClick={() => setShowAddDoctorModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddDoctor}>
                            <div className="form-left">
                                <div className="image-upload-section">
                                    <div className="image-preview">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#f0f4ff',
                                                color: '#1a237e'
                                            }}>
                                                Chưa có ảnh
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="doctorImage" className="upload-button">
                                        Chọn ảnh
                                    </label>
                                    <input
                                        type="file"
                                        id="doctorImage"
                                        accept="image/*"
                                        onChange={handleDoctorImageChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorExperience">Năm kinh nghiệm</label>
                                    <input
                                        type="number"
                                        id="doctorExperience"
                                        value={doctorForm.experience}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, experience: e.target.value }))}
                                        required
                                        placeholder="Nhập số năm kinh nghiệm"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorSpecialization">Chuyên ngành</label>
                                    <select
                                        id="doctorSpecialization"
                                        value={doctorForm.specialization}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                                        required
                                    >
                                        <option value="">Chọn chuyên ngành</option>
                                        {specializations.map(spec => (
                                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorGender">Giới tính</label>
                                    <select
                                        id="doctorGender"
                                        value={doctorForm.gender}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, gender: e.target.value }))}
                                        required
                                    >
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-right">
                                <div className="form-group">
                                    <label htmlFor="doctorName">Họ và tên</label>
                                    <input
                                        type="text"
                                        id="doctorName"
                                        value={doctorForm.name}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        placeholder="Nhập họ và tên bác sĩ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorEmail">Email</label>
                                    <input
                                        type="email"
                                        id="doctorEmail"
                                        value={doctorForm.email}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        placeholder="Nhập email bác sĩ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorPassword">Mật khẩu</label>
                                    <input
                                        type="password"
                                        id="doctorPassword"
                                        value={doctorForm.password}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, password: e.target.value }))}
                                        required
                                        placeholder="Nhập mật khẩu"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorPhone">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        id="doctorPhone"
                                        value={doctorForm.phone}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                        placeholder="Nhập số điện thoại"
                                        pattern="[0-9]{10}"
                                        title="Vui lòng nhập số điện thoại 10 chữ số"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorDateOfBirth">Ngày sinh</label>
                                    <input
                                        type="date"
                                        id="doctorDateOfBirth"
                                        value={doctorForm.dateOfBirth}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorAddress">Địa chỉ</label>
                                    <input
                                        type="text"
                                        id="doctorAddress"
                                        value={doctorForm.address}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, address: e.target.value }))}
                                        required
                                        placeholder="Nhập địa chỉ"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doctorAbout">Giới thiệu</label>
                                    <textarea
                                        id="doctorAbout"
                                        value={doctorForm.about}
                                        onChange={(e) => setDoctorForm(prev => ({ ...prev, about: e.target.value }))}
                                        required
                                        placeholder="Nhập giới thiệu về bác sĩ"
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-button" onClick={() => setShowAddDoctorModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="submit-button">
                                    Thêm bác sĩ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default Admin; 