import axios from '../lib/axios';

export const installationService = {
  getAll: async () => {
    try {
      const response = await axios.get('/installations');
      // Backend returns: { success, data: { installations: [...] } }
      const installations = response.data?.data?.installations;
      console.log('[installationService.getAll] Raw response:', response.data);
      console.log('[installationService.getAll] Extracted installations:', installations);
      return {
        success: true,
        data: Array.isArray(installations) ? installations : [],
      };
    } catch (error) {
      console.error('Get installations error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch installations',
      };
    }
  },

  getMyInstallations: async () => {
    try {
      const response = await axios.get('/installations/my');
      // Backend returns: { success, data: { installations: [...] } }
      const installations = response.data?.data?.installations;
      console.log('[installationService.getMyInstallations] Raw response:', response.data);
      console.log('[installationService.getMyInstallations] Extracted installations:', installations);
      return {
        success: true,
        data: Array.isArray(installations) ? installations : [],
      };
    } catch (error) {
      console.error('Get my installations error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch installations',
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`/installations/${id}`);
      // Backend returns: { success, data: { installation: {...} } }
      const installation = response.data?.data?.installation;
      return {
        success: true,
        data: installation || null,
      };
    } catch (error) {
      console.error('Get installation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch installation',
      };
    }
  },

  updateStatus: async (id, status, notes = '') => {
    try {
      const response = await axios.put(`/installations/${id}/status`, { status, notes });
      // Backend returns: { success, data: { installation: {...} } }
      const installation = response.data?.data?.installation;
      return {
        success: true,
        data: installation || null,
      };
    } catch (error) {
      console.error('Update installation status error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update installation',
      };
    }
  },

  assign: async (orderId, technicianId) => {
    try {
      const response = await axios.post('/installations/assign', { orderId, technicianId });
      // Backend returns: { success, data: { installation: {...} } }
      const installation = response.data?.data?.installation;
      return {
        success: true,
        data: installation || null,
      };
    } catch (error) {
      console.error('Assign technician error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to assign technician',
      };
    }
  },
};