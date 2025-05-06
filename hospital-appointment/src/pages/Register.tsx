import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { RegisterRequest } from '../types/api';
import '../styles/Register.css';
import logoImage from '../assets/logo.png';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterRequest>({
        name: '',
        email: '',
        password: '',
        phone: '',
        gender: 'MALE',
        dateOfBirth: '',
        avatarUrl: 'https://res.cloudinary.com/di53bdbjf/image/upload/v1746346822/hospital_appointment/avatar_jam4xb.png',
        address: ''
    });
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(1);
    const [passwordError, setPasswordError] = useState('');
    const [passwordInputError, setPasswordInputError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [dateOfBirthError, setDateOfBirthError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password: string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;

        if (!isLongEnough) {
            return 'Mật khẩu phải có ít nhất 8 ký tự';
        }
        if (!hasUpperCase) {
            return 'Mật khẩu phải có ít nhất một chữ hoa';
        }
        if (!hasNumber) {
            return 'Mật khẩu phải có ít nhất một chữ số';
        }
        if (hasSpecialChar) {
            return 'Mật khẩu không được chứa ký tự đặc biệt';
        }
        return '';
    };

    const validateDateOfBirth = (date: string) => {
        if (!date) return 'Vui lòng nhập ngày sinh';

        const selectedDate = new Date(date);
        const today = new Date();

        if (selectedDate > today) {
            return 'Ngày sinh không được vượt quá ngày hiện tại';
        }
        return '';
    };

    const validateStep = (step: number) => {
        const errors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.name.trim()) {
                errors.name = 'Vui lòng nhập họ và tên';
            }
            if (!formData.gender) {
                errors.gender = 'Vui lòng chọn giới tính';
            }
            const dateError = validateDateOfBirth(formData.dateOfBirth);
            if (dateError) {
                errors.dateOfBirth = dateError;
            }
        } else if (step === 2) {
            if (!formData.email.trim()) {
                errors.email = 'Vui lòng nhập email';
            } else if (!formData.email.endsWith('@gmail.com')) {
                errors.email = 'Email phải có đuôi @gmail.com';
            }
            if (!formData.phone.trim()) {
                errors.phone = 'Vui lòng nhập số điện thoại';
            } else if (!/^\d{10}$/.test(formData.phone)) {
                errors.phone = 'Số điện thoại phải có đúng 10 chữ số';
            }
            if (!formData.address.trim()) {
                errors.address = 'Vui lòng nhập địa chỉ';
            }
        } else if (step === 3) {
            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                errors.password = passwordError;
            }
            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Mật khẩu không khớp';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Chỉ cho phép nhập số cho trường số điện thoại
        if (name === 'phone' && !/^\d*$/.test(value)) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (name === 'password') {
            const error = validatePassword(value);
            setPasswordError(error);
            setPasswordInputError(!!error);

            if (formData.confirmPassword && value !== formData.confirmPassword) {
                setConfirmPasswordError('Mật khẩu không khớp');
            } else {
                setConfirmPasswordError('');
            }
        }

        if (name === 'confirmPassword') {
            if (value !== formData.password) {
                setConfirmPasswordError('Mật khẩu không khớp');
            } else {
                setConfirmPasswordError('');
            }
        }

        if (name === 'dateOfBirth') {
            const error = validateDateOfBirth(value);
            setDateOfBirthError(error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (validateStep(activeStep)) {
            try {
                await authService.register(formData);
                navigate('/login');
            } catch (err: any) {
                setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-title">Thông tin cá nhân</span>
            </div>
            <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-title">Thông tin liên hệ</span>
            </div>
            <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-title">Mật khẩu</span>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <div className="step-content">
                        <div className="form-group name-group">
                            <label htmlFor="name">Họ và tên</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={fieldErrors.name ? 'error-input' : ''}
                            />
                            {fieldErrors.name && <div className="error-message">{fieldErrors.name}</div>}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="gender">Giới tính</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className={`gender-select ${fieldErrors.gender ? 'error-input' : ''}`}
                                >
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                                {fieldErrors.gender && <div className="error-message">{fieldErrors.gender}</div>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dateOfBirth">Ngày sinh</label>
                                <div className="date-input-container">
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                        className={fieldErrors.dateOfBirth ? 'error-input' : ''}
                                    />
                                    <span className="calendar-icon">📅</span>
                                </div>
                                {fieldErrors.dateOfBirth && <div className="error-message">{fieldErrors.dateOfBirth}</div>}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="next-button" onClick={handleNext}>
                                Tiếp theo
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-content">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={fieldErrors.email ? 'error-input' : ''}
                            />
                            {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10}"
                                placeholder="Nhập số điện thoại 10 chữ số"
                                className={fieldErrors.phone ? 'error-input' : ''}
                            />
                            {fieldErrors.phone && <div className="error-message">{fieldErrors.phone}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Địa chỉ</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Nhập địa chỉ của bạn"
                                className={fieldErrors.address ? 'error-input' : ''}
                            />
                            {fieldErrors.address && <div className="error-message">{fieldErrors.address}</div>}
                        </div>
                        <div className="form-actions">
                            <button type="button" className="back-button" onClick={handleBack}>
                                Quay lại
                            </button>
                            <button type="button" className="next-button" onClick={handleNext}>
                                Tiếp theo
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-content">
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={fieldErrors.password ? 'error-input' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={togglePasswordVisibility}
                                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}
                            <div className="password-requirements">
                                <p>Mật khẩu phải có:</p>
                                <ul>
                                    <li>Ít nhất 8 ký tự</li>
                                    <li>Ít nhất một chữ hoa</li>
                                    <li>Ít nhất một chữ số</li>
                                    <li>Không chứa ký tự đặc biệt</li>
                                </ul>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={fieldErrors.confirmPassword ? 'error-input' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={toggleConfirmPasswordVisibility}
                                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showConfirmPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && <div className="error-message">{fieldErrors.confirmPassword}</div>}
                        </div>
                        <div className="form-actions">
                            <button type="button" className="back-button" onClick={handleBack}>
                                Quay lại
                            </button>
                            <button type="submit" className="register-button" disabled={isLoading}>
                                {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <div className="register-left">
                    <div className="logo-container">
                        <img src={logoImage} alt="Logo" className="register-logo" />
                        <h1 className="logo-text">Lofi Pharma</h1>
                    </div>
                    <div className="greeting">
                        <h2>Chỉ mất 1 phút để bắt đầu hành trình chăm sóc sức khỏe cho bạn và gia đình</h2>
                        <p>Đăng ký tài khoản ngay</p>
                    </div>
                </div>
                <div className="register-right">
                    <h2>Đăng Ký Tài Khoản</h2>
                    <p className="subtitle">Tham gia cùng chúng tôi để quản lý lịch hẹn y tế</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="register-form">
                        {renderStepIndicator()}
                        {renderStepContent()}
                    </form>

                    <div className="login-link">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 