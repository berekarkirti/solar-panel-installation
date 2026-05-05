import axios from '../lib/axios';

export const reviewService = {
  getAll: async () => {
    try {
      const response = await axios.get('/reviews');
      // Backend returns: { success, data: { reviews: [...] } }
      const reviews = response.data?.data?.reviews;
      console.log('[reviewService.getAll] Raw response:', response.data);
      console.log('[reviewService.getAll] Extracted reviews:', reviews);
      return {
        success: true,
        data: Array.isArray(reviews) ? reviews : [],
      };
    } catch (error) {
      console.error('Get reviews error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch reviews',
      };
    }
  },

  getMyReviews: async () => {
    try {
      const response = await axios.get('/reviews/my');
      // Backend returns: { success, data: { reviews: [...] } }
      const reviews = response.data?.data?.reviews;
      console.log('[reviewService.getMyReviews] Raw response:', response.data);
      console.log('[reviewService.getMyReviews] Extracted reviews:', reviews);
      return {
        success: true,
        data: Array.isArray(reviews) ? reviews : [],
      };
    } catch (error) {
      console.error('Get my reviews error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch reviews',
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`/reviews/${id}`);
      // Backend returns: { success, data: { review: {...} } }
      const review = response.data?.data?.review;
      return {
        success: true,
        data: review || null,
      };
    } catch (error) {
      console.error('Get review error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch review',
      };
    }
  },

  create: async (orderId, rating, comment = '') => {
    try {
      const response = await axios.post('/reviews', {
        orderId,
        rating,
        comment,
      });
      // Backend returns: { success, data: { review: {...} } }
      const review = response.data?.data?.review;
      return {
        success: true,
        data: review || null,
      };
    } catch (error) {
      console.error('Create review error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create review',
      };
    }
  },

  update: async (id, rating, comment) => {
    try {
      const response = await axios.put(`/reviews/${id}`, { rating, comment });
      // Backend returns: { success, data: { review: {...} } }
      const review = response.data?.data?.review;
      return {
        success: true,
        data: review || null,
      };
    } catch (error) {
      console.error('Update review error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update review',
      };
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`/reviews/${id}`);
      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete review error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete review',
      };
    }
  },

  getProductReviews: async (solarPanelId) => {
    try {
      const response = await axios.get(`/reviews/product/${solarPanelId}`);
      // Backend returns: { success: true, count: N, data: { reviews: [...] } }
      const reviews = response.data?.data?.reviews;
      return {
        success: true,
        data: Array.isArray(reviews) ? reviews : [],
      };
    } catch (error) {
      console.error('Get product reviews error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch product reviews',
      };
    }
  },

  createProductReview: async (solarPanelId, rating, comment = '') => {
    try {
      const response = await axios.post('/reviews', {
        solarPanelId,
        rating,
        comment,
      });
      // Backend returns: { success, data: { review: {...} } }
      const review = response.data?.data?.review;
      return {
        success: true,
        data: review || null,
      };
    } catch (error) {
      console.error('Create product review error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create review',
      };
    }
  },
};