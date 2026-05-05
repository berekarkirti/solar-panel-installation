import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roleCheck.middleware.js';
import { USER_ROLES } from '../constants/roles.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations
 */

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin & Technician)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 */
router.get('/stats', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN), adminController.getDashboardStats.bind(adminController));

export default router;
