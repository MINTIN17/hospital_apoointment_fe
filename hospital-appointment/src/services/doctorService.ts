import axiosInstance from '../config/axios';
import { doctorResponse } from '../types/api';


export const doctorService = {
    getDoctorsByHospital: async(hospitalId: number): Promise<doctorResponse[]> => {
        try {
            const response = await axiosInstance.get(`/doctor/getDoctorByHospital?hospital_id=${hospitalId}`);
            return response.data;
        } catch (error) {
            console.error('Doctor Service - Get by hospital failed:', error);
            throw error;
        }
    },

    async addDoctor(data: {
        registerRequest: {
            name: string;
            email: string;
            password: string;
            phone: string;
            gender: string;
            dateOfBirth: string;
            avatarUrl: string;
            address: string;
        };
        about: string;
        specialization_id: number;
        yearsOfExperience: number;
        hospital_id: number;
    }): Promise<String> {
        try {
            const response = await axiosInstance.post('/doctor/add', data);
            return response.data;
        } catch (error) {
            console.error('Doctor Service - Add failed:', error);
            throw error;
        }
    },

    banDoctor: async (doctorId: number) => {
        const response = await axiosInstance.put(`/doctor/ban?doctor_id=${doctorId}`);
        return response.data;
    },

    unbanDoctor: async (doctorId: number) => {
        const response = await axiosInstance.put(`/doctor/unban?doctor_id=${doctorId}`);
        return response.data;
    },

    updateDoctor: async (data: {
        id: number;
        name: string;
        email: string;
        phone: string;
        gender: string;
        dateOfBirth: string;
        avatarUrl: string;
        address: string;
        about: string;
        specialization_id: number;
        yearsOfExperience: number;
    }) => {
        try {
            const response = await axiosInstance.put('/doctor/updateDoctor', data);
            return response.data;
        } catch (error) {
            console.error('Doctor Service - Update failed:', error);
            throw error;
        }
    }
}; 