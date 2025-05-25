import axiosInstance from '../config/axios';

export interface Doctor {
    id: number;
    name: string;
    specialization_name: string;
    yearsOfExperience: number;
    hospital_id: number;
    gender: string;
    dateOfBirth: string;
    about: string;
    email: string;
    phone: string;
    // Thêm các trường khác nếu cần
}

export const getDoctorsByHospital = async (hospitalId: number): Promise<Doctor[]> => {
    try {
        const response = await axiosInstance.get(`/doctor/getDoctorByHospital?hospital_id=${hospitalId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
}; 