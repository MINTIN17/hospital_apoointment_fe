import axiosInstance from '../config/axios';
import { Appointment } from '../types/api';

interface RevisitRateResponse {
    revisitRate: string;
    daysWindow: number;
}

export const appointmentService = {
    async confirmAppointment(appointmentId: number): Promise<Appointment> {
        try {
            const response = await axiosInstance.put(`/appointment/confirmAppointment?appointment_id=${appointmentId}`);
            return response.data;
        } catch (error) {
            console.error('Appointment Service - Confirm failed:', error);
            throw error;
        }
    },

    async cancelAppointment(appointmentId: number): Promise<Appointment> {
        try {
            const response = await axiosInstance.put(`/appointment/cancelAppointment?appointment_id=${appointmentId}`);
            return response.data;
        } catch (error) {
            console.error('Appointment Service - Cancel failed:', error);
            throw error;
        }
    },

    async completeAppointment(appointmentId: number): Promise<Appointment> {
        try {
            const response = await axiosInstance.put(`/appointment/completeAppointment?appointment_id=${appointmentId}`);
            return response.data;
        } catch (error) {
            console.error('Appointment Service - Complete failed:', error);
            throw error;
        }
    },

    async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
        try {
            const response = await axiosInstance.get(`/appointment/getDoctorAppointment?doctor_id=${doctorId}`);
            return response.data;
        } catch (error) {
            console.error('Appointment Service - Get by doctor failed:', error);
            throw error;
        }
    },

    async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
        try {
            const response = await axiosInstance.get(`/appointment/getPatientAppointment?patient_id=${patientId}`);
            return response.data;
        } catch (error) {
            console.error('Appointment Service - Get by patient failed:', error);
            throw error;
        }
    },

    async getAppointmentsByAdmin(): Promise<Appointment[]> {
        try {
            const response = await axiosInstance.get(`/appointment/getAllAppointment`);
            return response.data;
        } catch (error) {
            console.error('Appointment Service - Get by patient failed:', error);
            throw error;
        }
    },

    async getCountAppointment(startDate?: string, endDate?: string): Promise<{ completed: number; cancelled: number }> {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const response = await axiosInstance.get(`/appointment/getCountAppointment?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Appointment Service - Get count failed:', error);
            throw error;
        }
    },

    async getCountAppointmentHospital(startDate: string, endDate: string): Promise<{ [key: string]: number }> {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        const response = await axiosInstance.get(`/appointment/getCountAppointmentHospital?${params.toString()}`);
        return response.data;
    },

    async getCountAppointmentDoctor(startDate: string, endDate: string): Promise<{
        doctorName: string;
        cancelled: number;
        completed: number;
    }[]> {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        const response = await axiosInstance.get(`/appointment/getCountAppointmentDoctor?${params.toString()}`);
        return response.data;
    },

    async getRevisitRate(): Promise<RevisitRateResponse> {
        const response = await axiosInstance.get<RevisitRateResponse>(`/appointment/revisit-rate`);
        return response.data;
    }
}; 