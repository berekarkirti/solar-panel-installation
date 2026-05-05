import express from 'express';
import installationController from '../controllers/installation.controller.js';
import {
  validateAssignTechnician,
  validateUpdateStatus,
  validateInstallationId,
} from '../validators/installation.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly, technicianOnly, authorize } from '../middlewares/roleCheck.middleware.js';
import USER_ROLES from '../constants/roles.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Installations
 *   description: Installation management and tracking
 */

/**
 * @swagger
 * /api/v1/installations/assign:
 *   post:
 *     summary: Assign technician to order (Admin only)
 *     tags: [Installations]
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
 *               - technicianId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               technicianId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439022"
 *     responses:
 *       201:
 *         description: Technician assigned successfully
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
 *                     installation:
 *                       $ref: '#/components/schemas/Installation'
 *       400:
 *         description: Order not PAID or installation already exists
 *       404:
 *         description: Order or technician not found
 */
router.post(
  '/assign',
  authenticate,
  adminOnly,
  validateAssignTechnician,
  installationController.assignTechnician.bind(installationController)
);

/**
 * @swagger
 * /api/v1/installations:
 *   get:
 *     summary: Get all installations (Admin only)
 *     tags: [Installations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All installations retrieved
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
 *                     installations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Installation'
 */
router.get('/', authenticate, adminOnly, installationController.getAllInstallations.bind(installationController));

/**
 * @swagger
 * /api/v1/installations/my:
 *   get:
 *     summary: Get my installations (Technician or Customer)
 *     tags: [Installations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Installations retrieved successfully
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
 *                     installations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Installation'
 */
router.get(
  '/my',
  authenticate,
  authorize(USER_ROLES.TECHNICIAN, USER_ROLES.CUSTOMER),
  installationController.getMyInstallations.bind(installationController)
);

/**
 * @swagger
 * /api/v1/installations/{id}/status:
 *   put:
 *     summary: Update installation status (Technician only)
 *     tags: [Installations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Installation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *                 example: IN_PROGRESS
 *               notes:
 *                 type: string
 *                 example: "Installation started at customer site"
 *     responses:
 *       200:
 *         description: Status updated successfully
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
 *                     installation:
 *                       $ref: '#/components/schemas/Installation'
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Not assigned to this installation
 *       404:
 *         description: Installation not found
 */
router.put(
  '/:id/status',
  authenticate,
  technicianOnly,
  validateInstallationId,
  validateUpdateStatus,
  installationController.updateStatus.bind(installationController)
);

export default router;