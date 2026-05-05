import axios from '../lib/axios';

export const adminUserService = {
    /**
     * Get all users with optional filters
     * @param {Object} params - Query parameters (role, search, page, limit)
     */
    getAllUsers: async (params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await axios.get(`/users${queryString ? `?${queryString}` : ''}`);
            return {
                success: true,
                data: response.data?.data?.users || [],
                pagination: response.data?.data?.pagination || null,
            };
        } catch (error) {
            console.error('Get users error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch users',
            };
        }
    },

    /**
     * Get a user by ID
     * @param {string} userId
     */
    getUserById: async (userId) => {
        try {
            const response = await axios.get(`/users/${userId}`);
            return {
                success: true,
                data: response.data?.data?.user || null,
            };
        } catch (error) {
            console.error('Get user error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch user',
            };
        }
    },

    /**
     * Create a new technician
     * @param {Object} technicianData - { email, password, firstName, lastName, phoneNumber }
     */
    createTechnician: async (technicianData) => {
        try {
            const response = await axios.post('/users/technicians', technicianData);
            return {
                success: true,
                data: response.data?.data?.user || null,
            };
        } catch (error) {
            console.error('Create technician error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to create technician',
            };
        }
    },

    /**
     * Update a technician
     * @param {string} userId
     * @param {Object} updateData - { firstName, lastName, phoneNumber, isActive, password }
     */
    updateTechnician: async (userId, updateData) => {
        try {
            const response = await axios.put(`/users/technicians/${userId}`, updateData);
            return {
                success: true,
                data: response.data?.data?.user || null,
            };
        } catch (error) {
            console.error('Update technician error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update technician',
            };
        }
    },

    /**
     * Delete a technician
     * @param {string} userId
     */
    deleteTechnician: async (userId) => {
        try {
            await axios.delete(`/users/technicians/${userId}`);
            return {
                success: true,
            };
        } catch (error) {
            console.error('Delete technician error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete technician',
            };
        }
    },

    /**
     * Toggle technician active status
     * @param {string} userId
     */
    toggleUserStatus: async (userId) => {
        try {
            const response = await axios.patch(`/users/${userId}/toggle-status`);
            return {
                success: true,
                data: response.data?.data?.user || null,
            };
        } catch (error) {
            console.error('Toggle status error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to toggle status',
            };
        }
    },
};
