import dotenv from 'dotenv';
import app from './src/app.js';
import database from './src/config/database.js';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server Function
 */
const startServer = async () => {
  try {
    // ═══════════════════════════════════════════════════════
    // STEP 1: Connect to Database
    // ═══════════════════════════════════════════════════════
    await database.connect();

    // ═══════════════════════════════════════════════════════
    // STEP 2: Start Express Server
    // ═══════════════════════════════════════════════════════
    const server = app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🚀 ${process.env.APP_NAME || 'Server'} is running`);
      console.log(`📡 Environment: ${NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      console.log('═══════════════════════════════════════════════════════');
    });

    // ═══════════════════════════════════════════════════════
    // GRACEFUL SHUTDOWN HANDLERS
    // ═══════════════════════════════════════════════════════

    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} signal received: starting graceful shutdown`);
      
      try {
        // Close HTTP server
        server.close(async () => {
          console.log('✅ HTTP server closed');
          
          // Close database connection
          await database.disconnect();
          
          console.log('👋 Graceful shutdown completed');
          process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
          console.error('⚠️  Forced shutdown after timeout');
          process.exit(1);
        }, 10000);

      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      console.error(err);
      await database.disconnect();
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (err) => {
      console.error('❌ Uncaught Exception:', err.message);
      console.error(err);
      await database.disconnect();
      process.exit(1);
    });

  } catch (error) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ Failed to start server');
    console.error('Error:', error.message);
    console.error('═══════════════════════════════════════════════════════');
    process.exit(1);
  }
};

// Start the server
startServer();