import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { validateAddToCart, validatePanelId } from '../validators/cart.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { customerOnly } from '../middlewares/roleCheck.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management (Customer only)
 */

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   example: Cart retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer only
 */
router.get('/', authenticate, customerOnly, cartController.getCart.bind(cartController));

/**
 * @swagger
 * /api/v1/cart/add:
 *   post:
 *     summary: Add solar panel to cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - solarPanelId
 *             properties:
 *               solarPanelId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               quantity:
 *                 type: number
 *                 default: 1
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Panel added to cart successfully
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
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error or panel inactive
 *       404:
 *         description: Solar panel not found
 */
router.post(
  '/add',
  authenticate,
  customerOnly,
  validateAddToCart,
  cartController.addToCart.bind(cartController)
);

/**
 * @swagger
 * /api/v1/cart/remove/{panelId}:
 *   delete:
 *     summary: Remove solar panel from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: panelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Solar panel ID to remove
 *     responses:
 *       200:
 *         description: Panel removed from cart successfully
 *       404:
 *         description: Cart or panel not found
 */
router.delete(
  '/remove/:panelId',
  authenticate,
  customerOnly,
  validatePanelId,
  cartController.removeFromCart.bind(cartController)
);

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
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
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 */
router.delete('/clear', authenticate, customerOnly, cartController.clearCart.bind(cartController));

export default router;