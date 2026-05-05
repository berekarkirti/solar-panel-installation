import express from 'express';
import authRoutes from './auth.routes.js';
import solarPanelRoutes from './solarPanel.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import installationRoutes from './installation.routes.js';
import reviewRoutes from './review.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use(`/api/${API_VERSION}/auth`, authRoutes);
router.use(`/api/${API_VERSION}/panels`, solarPanelRoutes);
router.use(`/api/${API_VERSION}/cart`, cartRoutes);
router.use(`/api/${API_VERSION}/orders`, orderRoutes);
router.use(`/api/${API_VERSION}/payments`, paymentRoutes);
router.use(`/api/${API_VERSION}/installations`, installationRoutes);
router.use(`/api/${API_VERSION}/reviews`, reviewRoutes);
router.use(`/api/${API_VERSION}/users`, userRoutes);
router.use(`/api/${API_VERSION}/admin`, adminRoutes);

export default router;