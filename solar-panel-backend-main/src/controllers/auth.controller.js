import authService from '../services/auth.service.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

class AuthController {
  /**
   * Register a new user
   * @route POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, role, firstName, lastName, phoneNumber } = req.body;

      const result = await authService.register({
        email,
        password,
        role,
        firstName,
        lastName,
        phoneNumber,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login with Google
   * @route POST /api/v1/auth/google
   */
  async googleLogin(req, res, next) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        const error = new Error('Google ID token is required');
        error.statusCode = 400;
        throw error;
      }

      const result = await authService.googleLogin(idToken);

      res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user
   * @route GET /api/v1/auth/me
   * @access Protected
   */
  async getMe(req, res, next) {
    try {
      // User is attached to req by auth middleware
      const user = await authService.getUserById(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   * @route PUT /api/v1/auth/me
   * @access Protected
   */
  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phoneNumber, address, city, password } = req.body;

      // DEBUG: Log what multer provides
      console.log('=== Profile Update Debug ===');
      console.log('req.file:', req.file);
      console.log('req.body.profileImage:', req.body.profileImage, typeof req.body.profileImage);
      console.log('===========================');

      // Initialize profileImage as undefined (will preserve existing if not updated)
      let profileImage;

      // Handle file upload - prioritize uploaded file
      if (req.file) {
        // Construct full URL (adjust based on your deployment)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        profileImage = `${baseUrl}/uploads/profiles/${req.file.filename}`;
        console.log('Using uploaded file, profileImage URL:', profileImage);
      } else if (req.body.profileImage && typeof req.body.profileImage === 'string' && req.body.profileImage.trim()) {
        // Only use body profileImage if it's a valid non-empty string (not an object from multer)
        profileImage = req.body.profileImage.trim();
        console.log('Using body profileImage:', profileImage);
      }
      // If neither file nor valid string URL, profileImage remains undefined and existing image is preserved

      const updatedUser = await authService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        phoneNumber,
        address,
        city,
        profileImage,
        password
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
const authController = new AuthController();
export default authController;