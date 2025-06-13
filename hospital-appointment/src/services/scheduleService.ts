import axiosInstance from '../config/axios';
import { Schedule } from '../types/api';

export const scheduleService = {
    getSchedule: async (doctorId: number): Promise<Schedule[]> => {
        try {
            const response = await axiosInstance.get(`/schedule/getSchedule?doctor_id=${doctorId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            throw error;
        }
    },

    updateAvailability: async (schedules: { id: number; available: boolean }[]): Promise<Schedule[]> => {
        try {
            const response = await axiosInstance.put('/schedule/availability', schedules);
            return response.data;
        } catch (error) {
            console.error('Error updating schedule availability:', error);
            throw error;
        }
    }
}; 