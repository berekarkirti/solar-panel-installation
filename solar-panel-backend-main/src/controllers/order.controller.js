import orderService from '../services/order.service.js';

/**
 * Order Controller
 * Handles HTTP requests for orders
 */

class OrderController {
  /**
   * Create order from cart
   * @route POST /api/v1/orders
   * @access Customer only
   */
  async createOrder(req, res, next) {
    try {
      const userId = req.user.userId;
      const { address, city } = req.body;

      const order = await orderService.createOrder(userId, { address, city });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in user's orders
   * @route GET /api/v1/orders/my
   * @access Customer only
   */
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user.userId;

      const orders = await orderService.getUserOrders(userId);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        count: orders.length,
        data: {
          orders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (Admin only)
   * @route GET /api/v1/orders
   * @access Admin only
   */
  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();

      res.status(200).json({
        success: true,
        message: 'All orders retrieved successfully',
        count: orders.length,
        data: {
          orders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   * @route GET /api/v1/orders/:id
   * @access Admin only
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      const order = await orderService.getOrderById(id);

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an order
   * @route PUT /api/v1/orders/:id/cancel
   * @access Customer (own orders) or Admin (any order)
   */
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const order = await orderService.cancelOrder(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
const orderController = new OrderController();
export default orderController;