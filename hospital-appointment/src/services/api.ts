import axios from 'axios';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ApiError, User } from '../types/api';

// Thay vì dùng URL tuyệt đối, dùng URL tương đối
const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để xử lý token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('API Request - Token exists:', !!token);
    if (token) {
        // Đảm bảo token bắt đầu bằng "Bearer "
        const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = tokenValue;
    }
    return config;
});

// Thêm interceptor để xử lý lỗi
api.interceptors.response.use(
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
            const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, credentials);
            console.log('Auth Service - Login successful');
            
            // Store token
            localStorage.setItem('token', response.data.token);
            
            // Lưu user data
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            console.log('Auth Service - Data stored in localStorage');
            return response.data;
        } catch (error) {
            console.error('Auth Service - Login failed:', error);
            throw error;
        }
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
    },

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        try {
            const response = await axios.post<RegisterResponse>(`${API_URL}/auth/register`, userData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
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
    }
};

export const specializationService = {
    async addSpecialization(data: { name: string; hospital_id: string }) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Không có token xác thực');
            }
            const response = await api.post('/specialization/add', data);
            return response.data;
        } catch (error) {
            console.error('Specialization Service - Add failed:', error);
            throw error;
        }
    },

    async getAllSpecializations(hospitalId: string) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Không có token xác thực');
            }
            const response = await api.get(`/specialization/getAll?hospital_id=${hospitalId}`);
            return response.data;
        } catch (error) {
            console.error('Specialization Service - Get all failed:', error);
            throw error;
        }
    }
};

export default api; 