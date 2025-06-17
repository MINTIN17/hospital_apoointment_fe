import axiosInstance from '../config/axios';
import { Hospital } from '../types/api';


export const hospitalService = {
    getAllHospitals: async (): Promise<Hospital[]> => {
        try {
            const response = await axiosInstance.get('/hospital/getAllHospital');
            return response.data;
        } catch (error) {
            console.error('Error fetching hospitals:', error);
            throw error;
        }
    },

    getHospitalById: async (id: number): Promise<Hospital> => {
        try {
            const response = await axiosInstance.get(`/hospital/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching hospital with id ${id}:`, error);
            throw error;
        }
    },

    addHospital: async (hospitalData: Omit<Hospital, 'id' | 'doctorCount' | 'specializationCount'>): Promise<Hospital> => {
        try {
            const response = await axiosInstance.post('/hospital/add', hospitalData);
            return response.data;
        } catch (error) {
            console.error('Error adding hospital:', error);
            throw error;
        }
    },

    updateHospital: async (hospitalData: {
        id: string;
        avatarUrl: string;
        name: string;
        address: string;
        phone: string;
    }) => {
        const response = await axiosInstance.put('/hospital/update', hospitalData);
        return response.data;
    },

    banHospital: async (hospitalId: number) => {
        const response = await axiosInstance.put(`/hospital/ban?hospital_id=${hospitalId}`);
        return response.data;
    },

    unbanHospital: async (hospitalId: number) => {
        const response = await axiosInstance.put(`/hospital/unban?hospital_id=${hospitalId}`);
        return response.data;
    }
}; 