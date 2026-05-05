import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import database from './config/database.js';
import routes from './routes/index.js';


// Create Express app
const app = express();

// ═══════════════════════════════════════════════════════
// SECURITY MIDDLEWARES
// ═══════════════════════════════════════════════════════
// Configure Helmet with cross-origin policies that allow image loading
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin image loading
  crossOriginEmbedderPolicy: false, // Disable to allow embedding
}));

// ═══════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// ═══════════════════════════════════════════════════════
// LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ═══════════════════════════════════════════════════════
// BODY PARSING MIDDLEWARES
// ═══════════════════════════════════════════════════════
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Serve static files from uploads directory with CORS headers
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add CORS headers specifically for uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// ═══════════════════════════════════════════════════════
// HEALTH CHECK ROUTE
// ═══════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  const dbStatus = database.isConnected() ? 'connected' : 'disconnected';
  const dbConnection = database.getConnection();

  res.status(200).json({
    success: true,
    message: 'Server is running smoothly',
    data: {
      service: process.env.APP_NAME || 'Solar Panel Installation System',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        name: dbConnection.name || 'N/A',
        host: dbConnection.host || 'N/A',
        port: dbConnection.port || 'N/A',
      },
    },
  });
});

// ═══════════════════════════════════════════════════════
// ROOT ROUTE
// ═══════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Solar Panel Installation System API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/api/health',
    },
  });
});

// ═══════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════
app.use(routes);

// ═══════════════════════════════════════════════════════
// SWAGGER API DOCUMENTATION
// ═══════════════════════════════════════════════════════
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the server and database connection
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running smoothly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Solar Panel API Docs',
}));

// ═══════════════════════════════════════════════════════
// 404 HANDLER - Route Not Found
// ═══════════════════════════════════════════════════════
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// ═══════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack,
    }),
  });
});

export default app;