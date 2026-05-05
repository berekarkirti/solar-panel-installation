import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/roleCheck.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (Admin only)
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (customers and technicians)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, TECHNICIAN]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', authenticate, adminOnly, userController.getAllUsers.bind(userController));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, adminOnly, userController.getUserById.bind(userController));

/**
 * @swagger
 * /api/v1/users/technicians:
 *   post:
 *     summary: Create a new technician
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Technician created successfully
 *       400:
 *         description: Email already exists
 */
router.post('/technicians', authenticate, adminOnly, userController.createTechnician.bind(userController));

/**
 * @swagger
 * /api/v1/users/technicians/{id}:
 *   put:
 *     summary: Update a technician
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Technician updated successfully
 *       403:
 *         description: Only technicians can be updated
 *       404:
 *         description: User not found
 */
router.put('/technicians/:id', authenticate, adminOnly, userController.updateTechnician.bind(userController));

/**
 * @swagger
 * /api/v1/users/technicians/{id}:
 *   delete:
 *     summary: Delete a technician
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Technician deleted successfully
 *       403:
 *         description: Only technicians can be deleted
 *       404:
 *         description: User not found
 */
router.delete('/technicians/:id', authenticate, adminOnly, userController.deleteTechnician.bind(userController));

/**
 * @swagger
 * /api/v1/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle technician active status
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status toggled successfully
 *       403:
 *         description: Only technician status can be toggled
 *       404:
 *         description: User not found
 */
router.patch('/:id/toggle-status', authenticate, adminOnly, userController.toggleUserStatus.bind(userController));

export default router;
