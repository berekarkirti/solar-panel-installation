import axios from '../lib/axios';

export const orderService = {
  getAll: async () => {
    try {
      const response = await axios.get('/orders');
      // Backend returns: { success, data: { orders: [...] } }
      const orders = response.data?.data?.orders;
      return {
        success: true,
        data: Array.isArray(orders) ? orders : [],
      };
    } catch (error) {
      console.error('Get orders error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch orders',
      };
    }
  },

  getMyOrders: async () => {
    try {
      const response = await axios.get('/orders/my');
      // Backend returns: { success, data: { orders: [...] } }
      const orders = response.data?.data?.orders;
      return {
        success: true,
        data: Array.isArray(orders) ? orders : [],
      };
    } catch (error) {
      console.error('Get my orders error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch orders',
      };
    }
  },

  /**
   * Get order by ID - works for both Admin and Customer
   * - Admin: calls /orders/:id (direct)
   * - Customer: calls /orders/my and finds the order
   */
  getById: async (id, userRole) => {
    try {
      // If admin, use direct endpoint
      if (userRole === 'ADMIN') {
        const response = await axios.get(`/orders/${id}`);
        const order = response.data?.data?.order;
        return {
          success: true,
          data: order || null,
        };
      }

      // For customers/technicians, fetch their orders and find the one
      const response = await axios.get('/orders/my');
      const orders = response.data?.data?.orders || [];
      const order = orders.find(o => o._id === id);

      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error('Get order error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch order',
      };
    }
  },

  create: async (orderData) => {
    try {
      const response = await axios.post('/orders', orderData);
      // Backend returns: { success, data: { order: {...} } }
      const order = response.data?.data?.order;
      return {
        success: true,
        data: order || null,
      };
    } catch (error) {
      console.error('Create order error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create order',
      };
    }
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order ID to cancel
   * @returns {Promise<Object>}
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await axios.put(`/orders/${orderId}/cancel`);
      // Backend returns: { success, data: { order: {...} } }
      const order = response.data?.data?.order;
      return {
        success: true,
        data: order || null,
      };
    } catch (error) {
      console.error('Cancel order error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to cancel order',
      };
    }
  },
};