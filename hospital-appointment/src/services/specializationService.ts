import axiosInstance from '../config/axios';
import { Specialization } from '../types/api';

export const specializationService = {
    async addSpecialization(data: { name: string; hospital_id: string }): Promise<String> {
        try {
            const response = await axiosInstance.post('/specialization/add', data);
            return response.data;
        } catch (error) {
            console.error('Specialization Service - Add failed:', error);
            throw error;
        }
    },

    async getAllSpecializations(hospitalId: string): Promise<Specialization[]> {
        try {
            const response = await axiosInstance.get(`/specialization/getAll?hospital_id=${hospitalId}`);
            return response.data;
        } catch (error) {
            console.error('Specialization Service - Get all failed:', error);
            throw error;
        }
    },

    async getSpecializationById(id: number): Promise<Specialization> {
        try {
            const response = await axiosInstance.get(`/specialization/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Specialization Service - Get by id ${id} failed:`, error);
            throw error;
        }
    }
}; 