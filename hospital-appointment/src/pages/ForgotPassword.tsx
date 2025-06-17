import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';
import logoImage from '../assets/logo.png';
import { authService } from '../services/api';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [showOTPInput, setShowOTPInput] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const startResendCountdown = () => {
        setResendDisabled(true);
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setResendDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendOTP = async () => {
        setError('');
        setSuccess('');
        try {
            const response = await authService.sendOTP(email);
            if (response === "Send otp") {
                setSuccess('Mã OTP mới đã được gửi đến email của bạn');
                startResendCountdown();
            } else if (response === "Invalid email") {
                setError('Email chưa được đăng ký trong hệ thống');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại sau');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã OTP');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await authService.sendOTP(email);
            if (response === "Send otp") {
                setSuccess('Mã OTP đã được gửi đến email của bạn');
                setShowOTPInput(true);
                startResendCountdown();
            } else if (response === "Invalid email") {
                setError('Email chưa được đăng ký trong hệ thống');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại sau');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã OTP');
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Tự động chuyển focus sang ô tiếp theo
            if (value && index < 5) {
                const nextInput = document.querySelector(`input[name=otp-${index + 1}]`) as HTMLInputElement;
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.querySelector(`input[name=otp-${index - 1}]`) as HTMLInputElement;
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Vui lòng nhập đủ 6 chữ số OTP');
            return;
        }

        try {
            const response = await authService.verifyOTP(email, otpString);
            if (response === "OTP OK") {
                setSuccess('Xác thực OTP thành công');
                setShowResetPassword(true);
            } else {
                setError('Mã OTP không đúng hoặc đã hết hạn');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            const response = await authService.forgotPassword(email, newPassword, 'PATIENT');
            if (response === "Reset password successfully") {
                setSuccess('Đặt lại mật khẩu thành công');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError('Có lỗi xảy ra khi đặt lại mật khẩu');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
        }
    };

    if (showResetPassword) {
        return (
            <div className="forgot-password-container">
                <div className="forgot-password-box">
                    <div className="forgot-password-left">
                        <div className="logo-container">
                            <img src={logoImage} alt="Logo" className="forgot-password-logo" />
                            <h1 className="logo-text">VietNam Pharma</h1>
                        </div>
                        <div className="greeting">
                            <h2>Đặt lại mật khẩu</h2>
                            <p>Nhập mật khẩu mới của bạn</p>
                        </div>
                    </div>
                    <div className="forgot-password-right">
                        <h2>Đặt lại mật khẩu</h2>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <form onSubmit={handleResetPassword} className="forgot-password-form">
                            <div className="form-group">
                                <label htmlFor="newPassword">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-button">
                                    Đặt lại mật khẩu
                                </button>
                            </div>
                        </form>
                        <div className="back-to-login">
                            <Link to="/login" style={{
                                color: '#4a90e2',
                                textDecoration: 'none',
                                fontSize: '14px',
                                display: 'block',
                                textAlign: 'center',
                                marginTop: '20px',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                    e.currentTarget.style.fontWeight = 'bold';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                    e.currentTarget.style.fontWeight = 'normal';
                                }}>
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <div className="forgot-password-left">
                    <div className="logo-container">
                        <img src={logoImage} alt="Logo" className="forgot-password-logo" />
                        <h1 className="logo-text">VietNam Pharma</h1>
                    </div>
                    <div className="greeting">
                        <h2>Quên mật khẩu?</h2>
                        <p>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</p>
                    </div>
                </div>
                <div className="forgot-password-right">
                    <h2>Đặt lại mật khẩu</h2>
                    <p className="subtitle">Nhập email đã đăng ký của bạn</p>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {!showOTPInput ? (
                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Nhập email của bạn"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-button">
                                    Gửi mã OTP
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="otp-form">
                            <p className="otp-instruction">Nhập mã OTP đã được gửi đến email của bạn</p>
                            <div className="otp-inputs">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        name={`otp-${index}`}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        maxLength={1}
                                        className="otp-input"
                                    />
                                ))}
                            </div>
                            <div className="otp-actions">
                                <button onClick={handleVerifyOTP} className="submit-button">
                                    Xác nhận
                                </button>
                                <button
                                    onClick={handleResendOTP}
                                    className="resend-button"
                                    disabled={resendDisabled}
                                >
                                    {resendDisabled ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="back-to-login">
                        <Link to="/login" style={{
                            color: '#4a90e2',
                            textDecoration: 'none',
                            fontSize: '14px',
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '20px',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                                e.currentTarget.style.fontWeight = 'bold';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                                e.currentTarget.style.fontWeight = 'normal';
                            }}>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 