import paymentService from '../services/payment.service.js';

/**
 * Payment Controller
 * Handles HTTP requests for payments
 */

class PaymentController {
  /**
   * Create payment intent
   * @route POST /api/v1/payments/create-intent
   * @access Customer only
   */
  async createPaymentIntent(req, res, next) {
    try {
      const userId = req.user.userId;
      const { orderId } = req.body;

      const result = await paymentService.createPaymentIntent(userId, orderId);

      res.status(201).json({
        success: true,
        message: 'Payment intent created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment
   * @route POST /api/v1/payments/confirm
   * @access Customer only
   */
  async confirmPayment(req, res, next) {
    try {
      const userId = req.user.userId;
      const { orderId, paymentIntentId } = req.body;

      const payment = await paymentService.confirmPayment(userId, orderId, paymentIntentId);

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          payment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in user's payment history
   * @route GET /api/v1/payments/my
   * @access Customer only
   */
  async getMyPayments(req, res, next) {
    try {
      const userId = req.user.userId;

      const payments = await paymentService.getUserPayments(userId);

      res.status(200).json({
        success: true,
        message: 'Payment history retrieved successfully',
        count: payments.length,
        data: {
          payments,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all payments (Admin only)
   * @route GET /api/v1/payments
   * @access Admin only
   */
  async getAllPayments(req, res, next) {
    try {
      const payments = await paymentService.getAllPayments();

      res.status(200).json({
        success: true,
        message: 'All payments retrieved successfully',
        count: payments.length,
        data: {
          payments,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
const paymentController = new PaymentController();
export default paymentController;