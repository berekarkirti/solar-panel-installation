import express from 'express';
import solarPanelController from '../controllers/solarPanel.controller.js';
import { validateCreatePanel, validateUpdatePanel } from '../validators/solarPanel.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/roleCheck.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Solar Panels
 *   description: Solar panel product management
 */

/**
 * @swagger
 * /api/v1/panels:
 *   get:
 *     summary: Get all active solar panels
 *     tags: [Solar Panels]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by panel name (case-insensitive)
 *       - in: query
 *         name: suitableFor
 *         schema:
 *           type: string
 *           enum: [residential_basic, residential_pro, commercial]
 *         description: Filter by suitable for residential_basic, residential_pro or commercial
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: Solar panels retrieved successfully
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
 *                 count:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     panels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SolarPanel'
 */
router.get('/', solarPanelController.getAllPanels.bind(solarPanelController));

/**
 * @swagger
 * /api/v1/panels/{id}:
 *   get:
 *     summary: Get solar panel by ID
 *     tags: [Solar Panels]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Solar panel ID
 *     responses:
 *       200:
 *         description: Solar panel retrieved successfully
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
 *                     panel:
 *                       $ref: '#/components/schemas/SolarPanel'
 *       404:
 *         description: Solar panel not found
 */
router.get('/:id', solarPanelController.getPanelById.bind(solarPanelController));

/**
 * @swagger
 * /api/v1/panels:
 *   post:
 *     summary: Create new solar panel (Admin only)
 *     tags: [Solar Panels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacityKW
 *               - price
 *               - suitableFor
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Solar Panel 500W"
 *               capacityKW:
 *                 type: number
 *                 example: 0.5
 *               price:
 *                 type: number
 *                 example: 15000
 *               description:
 *                 type: string
 *                 example: "High efficiency monocrystalline solar panel"
 *               suitableFor:
 *                 type: string
 *                 enum: [residential_basic, residential_pro, commercial]
 *                 example: "residential_basic"
 *     responses:
 *       201:
 *         description: Solar panel created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post(
    '/',
    authenticate,
    adminOnly,
    validateCreatePanel,
    solarPanelController.createPanel.bind(solarPanelController)
);

/**
 * @swagger
 * /api/v1/panels/{id}:
 *   put:
 *     summary: Update solar panel (Admin only)
 *     tags: [Solar Panels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Solar panel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               capacityKW:
 *                 type: number
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               suitableFor:
 *                 type: string
 *                 enum: [residential_basic, residential_pro, commercial]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Solar panel updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Solar panel not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put(
    '/:id',
    authenticate,
    adminOnly,
    validateUpdatePanel,
    solarPanelController.updatePanel.bind(solarPanelController)
);

/**
 * @swagger
 * /api/v1/panels/{id}:
 *   delete:
 *     summary: Delete solar panel - soft delete (Admin only)
 *     tags: [Solar Panels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Solar panel ID
 *     responses:
 *       200:
 *         description: Solar panel deleted successfully
 *       404:
 *         description: Solar panel not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete(
    '/:id',
    authenticate,
    adminOnly,
    solarPanelController.deletePanel.bind(solarPanelController)
);

export default router;