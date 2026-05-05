import express from 'express';
import reviewController from '../controllers/review.controller.js';
import { validateAddReview } from '../validators/review.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { customerOnly, adminOnly } from '../middlewares/roleCheck.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Customer reviews and ratings for installations
 */

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Add a review for a completed installation (Customer only)
 *     tags: [Reviews]
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
 *               - rating
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Excellent service! Installation was smooth and professional."
 *     responses:
 *       201:
 *         description: Review added successfully
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
 *                   example: Review added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     review:
 *                       $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error or review already exists
 *       403:
 *         description: Order does not belong to customer
 *       404:
 *         description: Order or installation not found
 */
router.post('/', authenticate, customerOnly, validateAddReview, reviewController.addReview.bind(reviewController));

/**
 * @swagger
 * /api/v1/reviews/my:
 *   get:
 *     summary: Get logged-in customer's reviews
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
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
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 */
router.get('/my', authenticate, customerOnly, reviewController.getMyReviews.bind(reviewController));

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Get all reviews (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All reviews retrieved successfully
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
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', authenticate, adminOnly, reviewController.getAllReviews.bind(reviewController));

/**
 * @swagger
 * /api/v1/reviews/product/{id}:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 */
router.get('/product/:id', reviewController.getProductReviews.bind(reviewController));

/**
 * @swagger
 * /api/v1/reviews/latest:
 *   get:
 *     summary: Get latest reviews (Public)
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Latest reviews retrieved successfully
 */
router.get('/latest', reviewController.getLatestReviews.bind(reviewController));


/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Review not found
 */
router.delete('/:id', authenticate, adminOnly, reviewController.deleteReview.bind(reviewController));

export default router;