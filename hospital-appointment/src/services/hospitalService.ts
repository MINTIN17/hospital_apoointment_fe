import axiosInstance from '../config/axios';

export interface Hospital {
    id: number;
    name: string;
    address: string;
    phone: string;
    rating: number;
    avatarUrl: string;
}

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

    addHospital: async (hospitalData: Omit<Hospital, 'id' | 'rating'>): Promise<Hospital> => {
        try {
            const response = await axiosInstance.post('/hospital/add', hospitalData);
            return response.data;
        } catch (error) {
            console.error('Error adding hospital:', error);
            throw error;
        }
    }
}; 