import express from 'express';
import orderController from '../controllers/order.controller.js';
import { validateOrderId, validateCreateOrder } from '../validators/order.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { customerOnly, adminOnly, authorize } from '../middlewares/roleCheck.middleware.js';
import USER_ROLES from '../constants/roles.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create order from cart (Customer only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - city
 *             properties:
 *               address:
 *                 type: string
 *                 example: "123 Solar St, Eco City"
 *               city:
 *                 type: string
 *                 example: "San Francisco"
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                   example: Order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation failed or Cart is empty
 *       404:
 *         description: Cart not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer only
 */
router.post('/', authenticate, customerOnly, validateCreateOrder, orderController.createOrder.bind(orderController));

/**
 * @swagger
 * /api/v1/orders/my:
 *   get:
 *     summary: Get logged-in customer's orders
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer only
 */
router.get('/my', authenticate, customerOnly, orderController.getMyOrders.bind(orderController));

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All orders retrieved successfully
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', authenticate, adminOnly, orderController.getAllOrders.bind(orderController));

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order (Customer for own orders, Admin for any)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot cancel order (not PENDING)
 *       403:
 *         description: Not authorized to cancel this order
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', authenticate, authorize(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN), validateOrderId, orderController.cancelOrder.bind(orderController));

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID (Admin only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/:id', authenticate, adminOnly, validateOrderId, orderController.getOrderById.bind(orderController));

export default router;