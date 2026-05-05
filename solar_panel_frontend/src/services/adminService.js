import axiosInstance from '../lib/axios';

export const adminService = {
    getStats: async () => {
        try {
            const response = await axiosInstance.get('/admin/stats');
            return response.data;
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch dashboard stats',
            };
        }
    },
};
