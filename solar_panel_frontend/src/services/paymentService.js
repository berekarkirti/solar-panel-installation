import axios from '../lib/axios';

/**
 * Helper to extract payment data from response
 */
const extractPaymentData = (responseData) => {
  // Response shape: { success, data: { payment: {...} } } or { success, data: {...} }
  return responseData?.data?.payment || responseData?.data || responseData;
};

export const paymentService = {
  /**
   * Create a payment intent for an order
   * Backend route: POST /payments/create-intent
   */
  createPaymentIntent: async (orderId) => {
    try {
      const response = await axios.post('/payments/create-intent', { orderId });
      const data = extractPaymentData(response.data);
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Create payment intent error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create payment intent',
      };
    }
  },

  /**
   * Get payment history for the logged-in user
   * Backend route: GET /payments/my
   */
  getMyPayments: async () => {
    try {
      const response = await axios.get('/payments/my');
      const payments = response.data?.data?.payments || [];
      return {
        success: true,
        data: Array.isArray(payments) ? payments : [],
      };
    } catch (error) {
      console.error('Get my payments error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch payments',
      };
    }
  },

  /**
   * Get payment by order ID
   * Note: Backend doesn't have this specific endpoint, so we fetch user's payments and find by order
   */
  getPaymentByOrder: async (orderId) => {
    try {
      const response = await axios.get('/payments/my');
      const payments = response.data?.data?.payments || [];
      const payment = payments.find(p => p.order?._id === orderId || p.order === orderId);

      if (payment) {
        return {
          success: true,
          data: payment,
        };
      }

      return {
        success: false,
        error: 'Payment not found for this order',
      };
    } catch (error) {
      console.error('Get payment by order error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch payment',
      };
    }
  },

  /**
   * Confirm/verify payment
   * Backend route: POST /payments/confirm
   */
  verifyPayment: async (orderId, paymentIntentId) => {
    try {
      const response = await axios.post('/payments/confirm', {
        orderId,
        paymentIntentId,
      });
      const data = extractPaymentData(response.data);
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Verify payment error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to verify payment',
      };
    }
  },

  /**
   * Get all payments (Admin only)
   * Backend route: GET /payments
   */
  getAllPayments: async () => {
    try {
      const response = await axios.get('/payments');
      const payments = response.data?.data?.payments || [];
      return {
        success: true,
        data: Array.isArray(payments) ? payments : [],
      };
    } catch (error) {
      console.error('Get all payments error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch payments',
      };
    }
  },
};