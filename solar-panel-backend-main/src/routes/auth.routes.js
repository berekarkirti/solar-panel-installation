import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validateRegister, validateLogin, validateUpdateProfile } from '../validators/auth.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadProfileImage } from '../middlewares/upload.middleware.js';

import { authorize, adminOnly, customerOnly, technicianOnly } from '../middlewares/roleCheck.middleware.js';
import USER_ROLES from '../constants/roles.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CUSTOMER, TECHNICIAN]
 *                 default: CUSTOMER
 *                 example: CUSTOMER
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateRegister, authController.register.bind(authController));

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateLogin, authController.login.bind(authController));

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Login/Register with Google
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: eyJhbGciOiJSUzI1NiIs...
 *     responses:
 *       200:
 *         description: Google login successful
 *       401:
 *         description: Google authentication failed
 */
router.post('/google', authController.googleLogin.bind(authController));

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, authController.getMe.bind(authController));

/**
 * @swagger
 * /api/v1/auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authenticate, uploadProfileImage.single('profileImage'), validateUpdateProfile, authController.updateProfile.bind(authController));



// ... existing routes ...

/**
 * @swagger
 * /api/v1/auth/admin-only:
 *   get:
 *     summary: Admin-only test endpoint
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/admin-only', authenticate, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, Admin!',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/v1/auth/customer-only:
 *   get:
 *     summary: Customer-only test endpoint
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       403:
 *         description: Forbidden - Customer role required
 */
router.get('/customer-only', authenticate, customerOnly, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, Customer!',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/v1/auth/technician-only:
 *   get:
 *     summary: Technician-only test endpoint
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       403:
 *         description: Forbidden - Technician role required
 */
router.get('/technician-only', authenticate, technicianOnly, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, Technician!',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/v1/auth/customer-or-admin:
 *   get:
 *     summary: Customer or Admin endpoint
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       403:
 *         description: Forbidden - Customer or Admin role required
 */
router.get('/customer-or-admin', authenticate, authorize(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome, Customer or Admin!',
    user: req.user,
  });
});

export default router;