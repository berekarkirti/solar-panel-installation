import Cart from '../models/Cart.js';
import SolarPanel from '../models/SolarPanel.js';

/**
 * Cart Service
 * Handles business logic for shopping cart
 */

class CartService {
  /**
   * Get user's cart
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getUserCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.solarPanel');

    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalAmount: 0,
      });
    }

    return cart;
  }

  /**
   * Add panel to cart
   * @param {string} userId
   * @param {string} panelId
   * @param {number} quantity
   * @returns {Promise<Object>}
   */
  async addToCart(userId, panelId, quantity = 1) {
    // Validate quantity
    if (quantity < 1) {
      const error = new Error('Quantity must be at least 1');
      error.statusCode = 400;
      throw error;
    }

    // Check if panel exists and is active
    const panel = await SolarPanel.findById(panelId);
    if (!panel) {
      const error = new Error('Solar panel not found');
      error.statusCode = 404;
      throw error;
    }

    if (!panel.isActive) {
      const error = new Error('This solar panel is not available');
      error.statusCode = 400;
      throw error;
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalAmount: 0,
      });
    }

    // Check if panel already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.solarPanel.toString() === panelId
    );

    if (existingItemIndex > -1) {
      // Panel exists, update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Panel doesn't exist, add new item
      cart.items.push({
        solarPanel: panelId,
        quantity: quantity,
      });
    }

    // Populate panel details to calculate total
    await cart.populate('items.solarPanel');

    // Calculate total amount
    cart.calculateTotal();

    // Save cart
    await cart.save();

    return cart;
  }

  /**
   * Remove panel from cart
   * @param {string} userId
   * @param {string} panelId
   * @returns {Promise<Object>}
   */
  async removeFromCart(userId, panelId) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    // Find item index
    const itemIndex = cart.items.findIndex(
      (item) => item.solarPanel.toString() === panelId
    );

    if (itemIndex === -1) {
      const error = new Error('Panel not found in cart');
      error.statusCode = 404;
      throw error;
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Populate and recalculate total
    await cart.populate('items.solarPanel');
    cart.calculateTotal();

    await cart.save();

    return cart;
  }

  /**
   * Clear entire cart
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    // Clear items and reset total
    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    return cart;
  }
}

// Export singleton instance
const cartService = new CartService();
export default cartService;