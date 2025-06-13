import axiosInstance from '../config/axios';
import { Patient } from '../types/api';

export const patientService = {
    async getAllPatients(): Promise<Patient[]> {
        try {
            const response = await axiosInstance.get('/patient/getAllPatient');
            return response.data;
        } catch (error) {
            console.error('Patient Service - Get all failed:', error);
            throw error;
        }
    },

    async getPatientById(id: string): Promise<Patient> {
        try {
            const response = await axiosInstance.get(`/patient/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Patient Service - Get by id ${id} failed:`, error);
            throw error;
        }
    }
}; 