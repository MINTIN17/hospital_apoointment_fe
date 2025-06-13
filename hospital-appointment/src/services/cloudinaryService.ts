import axios from 'axios';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/di53bdbjf/image/upload';

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
}

export const cloudinaryService = {
    uploadImage: async (file: File, uploadPreset: string): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            formData.append('cloud_name', 'di53bdbjf');

            const response = await axios.post<CloudinaryResponse>(CLOUDINARY_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.data.secure_url) {
                throw new Error('No secure URL returned from Cloudinary');
            }

            return response.data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            if (axios.isAxiosError(error)) {
                console.error('Cloudinary response:', error.response?.data);
            }
            throw new Error('Failed to upload image to Cloudinary');
        }
    }
}; 