import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
/**
 * MongoDB Connection Configuration
 * Establishes connection to MongoDB using Mongoose
 */

class Database {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.dbName = process.env.DB_NAME;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      // Mongoose connection options
      const options = {
        dbName: this.dbName,
        maxPoolSize: 10, // Maximum number of connections in the pool
        minPoolSize: 5, // Minimum number of connections in the pool
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        serverSelectionTimeoutMS: 10000, // Timeout for selecting a server
        family: 4, // Use IPv4, skip trying IPv6
      };

      // Connect to MongoDB
      await mongoose.connect(this.mongoUri, options);

      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ MongoDB Connection Successful');
      console.log(`📦 Database: ${this.dbName}`);
      console.log(`🔗 Host: ${mongoose.connection.host}`);
      console.log(`📡 Port: ${mongoose.connection.port}`);
      console.log('═══════════════════════════════════════════════════════');

      // Connection event listeners
      this.setupEventListeners();

    } catch (error) {
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ MongoDB Connection Failed');
      console.error('Error:', error.message);
      console.error('═══════════════════════════════════════════════════════');
      
      // Exit process with failure
      process.exit(1);
    }
  }

  /**
   * Setup MongoDB event listeners
   */
  setupEventListeners() {
    // Connected event
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    // Error event
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    // Disconnected event
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // Reconnected event
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
    });
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ MongoDB Connection Closed Gracefully');
      console.log('═══════════════════════════════════════════════════════');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get database instance
   */
  getConnection() {
    return mongoose.connection;
  }
}

// Export singleton instance
const database = new Database();
export default database;