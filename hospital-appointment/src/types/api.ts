export interface User {
    name: string;
    email: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
    enabled: boolean;
}

export interface Patient {
    id: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
}

export interface RegisterResponse {
    user: User;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    patient: Patient;
}

export interface ApiError {
    message: string;
    status: number;
}