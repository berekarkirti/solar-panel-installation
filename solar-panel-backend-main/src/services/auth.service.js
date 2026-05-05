import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwtConfig from '../config/jwt.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Authentication Service
 * Handles authentication logic (hashing, token generation, validation)
 */

class AuthService {
  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>}
   */
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate JWT access token
   * @param {Object} payload - Data to encode in token (userId, email, role)
   * @returns {string} JWT token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  }

  /**
   * Generate JWT refresh token
   * @param {Object} payload - Data to encode in token
   * @returns {string} Refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  }

  /**
   * Verify JWT access token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Verify JWT refresh token
   * @param {string} token - Refresh token
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and tokens
   */
  async register(userData) {
    const { email, password, role, firstName, lastName, phoneNumber } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'CUSTOMER', // Default to CUSTOMER
      firstName,
      lastName,
      phoneNumber,
    });

    // Generate tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and tokens
   */
  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error('Account is deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    return user.toSafeObject();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  async updateProfile(userId, updateData) {
    console.log('=== Auth Service updateProfile ===');
    console.log('updateData received:', updateData);

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    console.log('User before update - profileImage:', user.profileImage);

    // Update fields if provided
    if (updateData.firstName !== undefined) user.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) user.lastName = updateData.lastName;
    if (updateData.phoneNumber !== undefined) user.phoneNumber = updateData.phoneNumber;
    if (updateData.address !== undefined) user.address = updateData.address;
    if (updateData.city !== undefined) user.city = updateData.city;
    // Only update profileImage if a valid URL is provided (prevents null/empty from overwriting)
    if (updateData.profileImage) {
      user.profileImage = updateData.profileImage;
      console.log('Setting profileImage to:', updateData.profileImage);
    }

    // Only allow password update if specifically handled, usually separate endpoint.
    // But if requested here:
    if (updateData.password) {
      user.password = await this.hashPassword(updateData.password);
    }

    await user.save();

    console.log('User after save - profileImage:', user.profileImage);
    console.log('=================================');

    return user.toSafeObject();
  }

  /**
   * Login with Google
   * @param {string} idToken - Google ID token from frontend
   * @returns {Promise<Object>} User and tokens
   */
  async googleLogin(idToken) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: profileImage } = payload;

      // Find user by googleId or email
      let user = await User.findOne({
        $or: [
          { googleId },
          { email: email.toLowerCase() }
        ]
      });

      if (user) {
        // If user exists but doesn't have googleId (registered with email/password before), link it
        if (!user.googleId) {
          user.googleId = googleId;
        }

        // Update profile image if not set
        if (!user.profileImage) {
          user.profileImage = profileImage;
        }

        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          googleId,
          firstName,
          lastName,
          profileImage,
          role: 'CUSTOMER', // Default role
          isActive: true
        });
      }

      // Generate tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      return {
        user: user.toSafeObject(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Google Auth Error:', error);
      const authError = new Error('Google authentication failed');
      authError.statusCode = 401;
      throw authError;
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;