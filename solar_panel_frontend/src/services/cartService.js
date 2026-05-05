import axios from '../lib/axios';

/**
 * Helper to extract cart data from various response shapes
 */
const extractCartData = (responseData) => {
  // Shape 1: { data: { cart: { items: [...], totalAmount } } }
  if (responseData?.data?.cart) {
    return responseData.data.cart;
  }

  // Shape 2: { cart: { items: [...], totalAmount } }
  if (responseData?.cart) {
    return responseData.cart;
  }

  // Shape 3: { data: { items: [...], totalAmount } }
  if (responseData?.data?.items) {
    return responseData.data;
  }

  // Shape 4: { items: [...], totalAmount }
  if (responseData?.items) {
    return responseData;
  }

  // Shape 5: data is the cart itself with items
  if (responseData?.data && Array.isArray(responseData.data.items)) {
    return responseData.data;
  }

  return { items: [], totalAmount: 0 };
};

/**
 * Helper to extract error message from error object
 */
const getErrorMessage = (error, defaultMessage) => {
  return error.response?.data?.message || error.message || defaultMessage;
};

export const cartService = {
  getCart: async () => {
    try {
      const response = await axios.get('/cart');
      const cart = extractCartData(response.data);

      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      console.error('Get cart error:', error);
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to fetch cart'),
        data: { items: [], totalAmount: 0 },
      };
    }
  },

  /**
   * Add item to cart - backend ADDS quantity to existing
   * @param {string} solarPanelId 
   * @param {number} quantity - quantity to ADD (not set)
   */
  addItem: async (solarPanelId, quantity = 1) => {
    try {
      const response = await axios.post('/cart/add', { solarPanelId, quantity });
      const cart = extractCartData(response.data);

      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to add item to cart'),
      };
    }
  },

  /**
   * Increment quantity by 1
   * Backend's /cart/add ADDS to existing quantity, so we always add 1
   */
  incrementQuantity: async (solarPanelId) => {
    try {
      const response = await axios.post('/cart/add', { solarPanelId, quantity: 1 });
      const cart = extractCartData(response.data);

      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      console.error('Increment quantity error:', error);
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to update quantity'),
      };
    }
  },

  /**
   * Decrement quantity by 1
   * Backend doesn't support decrement, so we remove and re-add with new quantity
   */
  decrementQuantity: async (solarPanelId, currentQuantity) => {
    try {
      const newQuantity = currentQuantity - 1;

      if (newQuantity < 1) {
        return {
          success: false,
          error: 'Quantity cannot be less than 1',
        };
      }

      // Remove the item completely first
      await axios.delete(`/cart/remove/${solarPanelId}`);

      // Re-add with the new quantity
      const response = await axios.post('/cart/add', { solarPanelId, quantity: newQuantity });
      const cart = extractCartData(response.data);

      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      console.error('Decrement quantity error:', error);
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to update quantity'),
      };
    }
  },

  removeItem: async (panelId) => {
    try {
      const response = await axios.delete(`/cart/remove/${panelId}`);
      const cart = extractCartData(response.data);

      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }

      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      console.error('Remove item error:', error);
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to remove item'),
      };
    }
  },

  clearCart: async () => {
    try {
      const response = await axios.delete('/cart/clear');
      const cart = extractCartData(response.data);

      return {
        success: true,
        data: cart || { items: [], totalAmount: 0 },
      };
    } catch (error) {
      console.error('Clear cart error:', error);
      return {
        success: false,
        error: getErrorMessage(error, 'Failed to clear cart'),
      };
    }
  },

  createOrder: async (addressData) => {
    try {
      const response = await axios.post('/orders', addressData);
      // Backend returns: { success, data: { order: {...} } }
      const order = response.data?.data?.order || response.data?.data || response.data;

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      console.error('Create order error:', error);

      // Get the specific error message from backend
      const errorMessage = getErrorMessage(error, 'Failed to create order');

      return {
        success: false,
        error: errorMessage,
        // Include status code for the UI to handle appropriately
        status: error.response?.status,
      };
    }
  },
};