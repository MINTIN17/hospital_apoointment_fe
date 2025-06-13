import axiosInstance from '../config/axios';
import { Appointment } from '../types/api';

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
    }
}; 