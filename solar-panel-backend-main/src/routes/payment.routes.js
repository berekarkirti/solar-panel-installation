import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { validateCreateIntent, validateConfirmPayment } from '../validators/payment.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { customerOnly, adminOnly } from '../middlewares/roleCheck.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management using Stripe
 */

/**
 * @swagger
 * /api/v1/payments/create-intent:
 *   post:
 *     summary: Create Stripe payment intent (Customer only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                     clientSecret:
 *                       type: string
 *                       description: Use this to complete payment on client side
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Validation error or payment already exists
 *       403:
 *         description: Order does not belong to user
 *       404:
 *         description: Order not found
 */
router.post(
  '/create-intent',
  authenticate,
  customerOnly,
  validateCreateIntent,
  paymentController.createPaymentIntent.bind(paymentController)
);

/**
 * @swagger
 * /api/v1/payments/confirm:
 *   post:
 *     summary: Confirm payment and update order status (Customer only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentIntentId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               paymentIntentId:
 *                 type: string
 *                 example: "pi_3ABC123def456GHI"
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Payment failed or already confirmed
 *       404:
 *         description: Payment not found
 */
router.post(
  '/confirm',
  authenticate,
  customerOnly,
  validateConfirmPayment,
  paymentController.confirmPayment.bind(paymentController)
);

/**
 * @swagger
 * /api/v1/payments/my:
 *   get:
 *     summary: Get logged-in customer's payment history
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 */
router.get('/my', authenticate, customerOnly, paymentController.getMyPayments.bind(paymentController));

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get all payments (Admin only)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', authenticate, adminOnly, paymentController.getAllPayments.bind(paymentController));

export default router;