import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';

/**
 * Order Service
 * Handles business logic for orders
 */

class OrderService {
  /**
   * Create order from user's cart
   * @param {string} userId
   * @param {Object} addressData - { address, city }
   * @returns {Promise<Object>}
   */
  async createOrder(userId, addressData) {
    // Get user's cart with populated panel details
    const cart = await Cart.findOne({ user: userId }).populate('items.solarPanel');

    if (!cart) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if cart is empty
    if (cart.items.length === 0) {
      const error = new Error('Cannot create order from empty cart');
      error.statusCode = 400;
      throw error;
    }

    // Prepare order items with priceAtPurchase
    const orderItems = cart.items.map((item) => ({
      solarPanel: item.solarPanel._id,
      quantity: item.quantity,
      priceAtPurchase: item.solarPanel.price, // Save current price
    }));

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress: {
        address: addressData.address,
        city: addressData.city,
      },
      status: ORDER_STATUS.PENDING,
    });

    // Update user profile with latest address/city if not already present or different
    await User.findByIdAndUpdate(userId, {
      address: addressData.address,
      city: addressData.city,
    });

    // Clear cart after order creation
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Populate order details for response
    await order.populate('items.solarPanel');
    await order.populate('user', 'email firstName lastName');

    return order;
  }

  /**
   * Get all orders for a specific user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getUserOrders(userId) {
    const orders = await Order.find({ user: userId })
      .populate('items.solarPanel')
      .sort({ createdAt: -1 });

    return orders;
  }

  /**
   * Get all orders (Admin only)
   * @returns {Promise<Array>}
   */
  async getAllOrders() {
    const orders = await Order.find()
      .populate('items.solarPanel')
      .populate('user', 'email firstName lastName role')
      .sort({ createdAt: -1 });

    return orders;
  }

  /**
   * Get single order by ID
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate('items.solarPanel')
      .populate('user', 'email firstName lastName role');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  /**
   * Verify order ownership
   * @param {string} orderId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async verifyOrderOwnership(orderId, userId) {
    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.user.toString() !== userId) {
      const error = new Error('You do not have permission to access this order');
      error.statusCode = 403;
      throw error;
    }

    return true;
  }

  /**
   * Cancel an order
   * @param {string} orderId
   * @param {string} userId - For ownership verification
   * @param {string} userRole - To allow admin to cancel any order
   * @returns {Promise<Object>}
   */
  async cancelOrder(orderId, userId, userRole) {
    const order = await Order.findById(orderId)
      .populate('items.solarPanel')
      .populate('user', 'email firstName lastName');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership (unless admin)
    if (userRole !== 'ADMIN' && order.user._id.toString() !== userId) {
      const error = new Error('You do not have permission to cancel this order');
      error.statusCode = 403;
      throw error;
    }

    // Can only cancel PENDING orders
    if (order.status !== ORDER_STATUS.PENDING) {
      const error = new Error(`Cannot cancel order with status: ${order.status}. Only PENDING orders can be cancelled.`);
      error.statusCode = 400;
      throw error;
    }

    // Update status to CANCELLED
    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    return order;
  }
}

// Export singleton instance
const orderService = new OrderService();
export default orderService;