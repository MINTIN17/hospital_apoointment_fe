import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

interface PredictionResponse {
    prediction: string;
    confidence: number;
}

export const diagnosisService = {
    predict: async (text: string): Promise<PredictionResponse> => {
        try {
            const response = await axios.post(`${BASE_URL}/predict`, { text });
            return response.data;
        } catch (error) {
            console.error('Error in prediction:', error);
            throw error;
        }
    }
}; 