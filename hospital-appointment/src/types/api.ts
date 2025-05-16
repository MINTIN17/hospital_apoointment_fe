export interface User {
    name: string;
    email: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
    role: 'PATIENT' | 'DOCTOR';
    enabled: boolean;
}
export interface doctorResponse {
    id: string;
    about: string;
    name: string;
    email: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
    specialization_name: string;
    hospital_name: string;
    role: 'PATIENT' | 'DOCTOR';
    yearsOfExperience: number;
    // enabled: boolean;
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
    doctorResponse: doctorResponse;
}

export interface ApiError {
    message: string;
    status: number;
}