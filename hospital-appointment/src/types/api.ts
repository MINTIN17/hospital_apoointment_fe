export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
    enabled: boolean;
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
    token?: string;
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
    yearsOfExperience: number;
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
    doctorResponse: doctorResponse;
}

export interface ApiError {
    message: string;
    status: number;
}

export interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    patient_name: string;
    doctor_name: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    appointmentDate: string;
    startTime: string;
    endTime: string;
    description: string;
}

export interface Doctor {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    avatarUrl: string;
    address: string;
    about: string;
    specialization_name: string;
    yearsOfExperience: number;
    hospital: {
        id: number;
        name: string;
        address: string;
    };
}

export interface Schedule {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface Hospital {
    id: number;
    avatarUrl: string;
    name: string;
    address: string;
    phone: string;
    doctorCount: number;
    specializationCount: number;
    enabled : boolean;
}

export interface Specialization {
    id: number;
    name: string;
    description: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
    user_id: number;
    role: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}