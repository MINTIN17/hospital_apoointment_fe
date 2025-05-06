export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
    createdAt: string;
    updatedAt: string;
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
    user: User;
    token: string;
}

export interface ApiError {
    message: string;
    status: number;
}