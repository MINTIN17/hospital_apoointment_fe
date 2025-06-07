import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Profile.css';
import logoImage from '../assets/logo.png';
import axios from 'axios';

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const userInfo = JSON.parse(userData);
                    if (userInfo.user) {
                        setUser({
                            name: userInfo.user.name,
                            email: userInfo.user.email,
                            phone: userInfo.user.phone,
                            gender: userInfo.user.gender,
                            dateOfBirth: userInfo.user.dateOfBirth,
                            avatarUrl: userInfo.user.avatarUrl,
                            address: userInfo.user.address
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                throw new Error('User data not found');
            }

            const userInfo = JSON.parse(userData);
            const patientId = userInfo.patient.id;

            const formData = new FormData();
            if (selectedFile) {
                formData.append("file", selectedFile);
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

                // Cập nhật avatarUrl trong user object
                user.avatarUrl = uploadResponse.data.secure_url;
            }

            // Cập nhật thông tin user
            const response = await axios.put(
                `http://localhost:8801/api/patient/update/${patientId}`,
                {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    gender: user.gender,
                    dateOfBirth: user.dateOfBirth,
                    avatarUrl: user.avatarUrl,
                    address: user.address
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Cập nhật localStorage với thông tin mới
            const updatedUserData = {
                ...userInfo,
                user: {
                    ...userInfo.user,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    gender: user.gender,
                    dateOfBirth: user.dateOfBirth,
                    avatarUrl: user.avatarUrl,
                    address: user.address
                }
            };
            localStorage.setItem('user', JSON.stringify(updatedUserData));

            showNotification('Cập nhật thông tin thành công', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Cập nhật thông tin thất bại');
            } else {
                setError('Đã xảy ra lỗi không xác định');
            }
        } finally {
            setIsLoading(false);
        }
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