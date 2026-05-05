import axios from '../lib/axios';

export const userService = {
  getProfile: async () => {
    try {
      const response = await axios.get('/auth/me');
      // Backend returns: { success, data: { user } }
      const user = response.data?.data?.user;
      return {
        success: true,
        data: user || null,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch profile',
      };
    }
  },

  updateProfile: async (profileData) => {
    try {
      // Check if profileData suggests it's FormData (files included)
      const isFormData = profileData instanceof FormData;

      // IMPORTANT: Do NOT set Content-Type for FormData - axios will auto-set it with proper boundary
      const config = {
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      };

      const response = await axios.put('/auth/me', profileData, config);
      // Backend returns: { success, data: { user } }
      const user = response.data?.data?.user || response.data?.data;
      return {
        success: true,
        data: user || null,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update profile',
      };
    }
  },
};