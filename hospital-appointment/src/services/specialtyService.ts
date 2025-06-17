import axiosInstance from '../config/axios';

interface SpecialtyResponse {
    specialty: string;
}

export const specialtyService = {
    getSpecialtyByDisease: async (disease: string): Promise<string> => {
        try {
            const response = await axiosInstance.get(`/disease/getSpecialty`, {
                params: { disease }
            });
            return response.data;

        } catch (error) {
            console.error('Error getting specialty:', error);
            return '';
        }
    }
}; 