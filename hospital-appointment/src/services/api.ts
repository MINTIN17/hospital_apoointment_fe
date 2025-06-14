import axiosInstance from '../config/axios';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ApiError, User, ChangePasswordRequest, ChangePasswordResponse } from '../types/api';

// Hàm decode JWT token
const decodeJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

// Thêm interceptor để xử lý token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('API Request - Token exists:', !!token);
    if (token) {
        // Đảm bảo token bắt đầu bằng "Bearer "
        const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = tokenValue;
        
        // Decode và log token payload
        const decodedToken = decodeJwt(token.replace('Bearer ', ''));
        console.log('Decoded Token Payload:', decodedToken);
    }
    return config;
});

// Thêm interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('API Response - Status:', response.status);
        return response;
    },
    (error) => {
        console.error('API Error:', error);
        if (error.response) {
            if (error.response.status === 401) {
                console.log('API - Unauthorized, clearing token');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            const apiError: ApiError = {
                message: error.response.data.message || 'Có lỗi xảy ra',
                status: error.response.status,
            };
            return Promise.reject(apiError);
        }
        return Promise.reject(error);
    }
);

export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('Auth Service - Attempting login');
            const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
            console.log('Auth Service - Login successful');
            
            localStorage.setItem('token', response.data.token);
            
            const decodedToken = decodeJwt(response.data.token.replace('Bearer ', ''));
            console.log('Login - Decoded Token:', decodedToken);
            console.log('Login - Token payload:', {
                role: decodedToken?.role,
                sub: decodedToken?.sub,
                exp: decodedToken?.exp
            });
            
            if (decodedToken && decodedToken.role) {
                console.log('Role từ token:', decodedToken.role);
                
                switch(decodedToken.role) {
                    case 'PATIENT':
                        if (response.data.patient) {
                            const userData = {
                                ...response.data.patient,
                                role: decodedToken.role
                            };
                            console.log('User data with role (PATIENT):', userData);
                            localStorage.setItem('user', JSON.stringify(userData));
                        }
                        break;
                    case 'DOCTOR':
                        if (response.data.doctorResponse) {
                            const userData = {
                                ...response.data.doctorResponse,
                                role: decodedToken.role
                            };
                            console.log('User data with role (DOCTOR):', userData);
                            localStorage.setItem('user', JSON.stringify(userData));
                        }
                        break;
                    default:
                        console.warn('Role không xác định trong token:', decodedToken.role);
                }
            } else {
                console.warn('Không tìm thấy role trong token');
            }
            
            console.log('Auth Service - Data stored in localStorage');
            return response.data;
        } catch (error) {
            console.error('Auth Service - Login failed:', error);
            throw error;
        }
    },

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        try {
            const response = await axiosInstance.post<RegisterResponse>('/auth/register', userData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async changePassword(data: ChangePasswordRequest): Promise<String> {
        try {
            const response = await axiosInstance.put<String>('/auth/changePassword', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        console.log('Auth Service - Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        return !!token && token.startsWith('Bearer ');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Auth Service - Error parsing user data:', error);
            return null;
        }
    }
}; 