import axios from '../lib/axios';

export const panelService = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get('/panels', { params });
      // Backend returns: { success, data: { panels: [...] } }
      const panels = response.data?.data?.panels;
      return {
        success: true,
        data: Array.isArray(panels) ? panels : [],
      };
    } catch (error) {
      console.error('Get panels error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch panels',
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`/panels/${id}`);
      // Backend returns: { success, data: { panel: {...} } }
      const panel = response.data?.data?.panel;
      return {
        success: true,
        data: panel || null,
      };
    } catch (error) {
      console.error('Get panel error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch panel',
      };
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post('/panels', data);
      return {
        success: true,
        data: response.data?.data?.panel,
      };
    } catch (error) {
      console.error('Create panel error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create panel',
      };
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`/panels/${id}`, data);
      return {
        success: true,
        data: response.data?.data?.panel,
      };
    } catch (error) {
      console.error('Update panel error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update panel',
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`/panels/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Delete panel error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete panel',
      };
    }
  },
};