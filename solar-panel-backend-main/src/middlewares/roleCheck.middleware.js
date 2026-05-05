import USER_ROLES from '../constants/roles.js';

/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role(s)
 */

/**
 * Check if user has one of the allowed roles
 * @param  {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Shorthand middleware for admin-only routes
 */
export const adminOnly = authorize(USER_ROLES.ADMIN);

/**
 * Shorthand middleware for customer routes
 */
export const customerOnly = authorize(USER_ROLES.CUSTOMER);

/**
 * Shorthand middleware for technician routes
 */
export const technicianOnly = authorize(USER_ROLES.TECHNICIAN);

/**
 * Middleware for routes accessible by customers and admins
 */
export const customerOrAdmin = authorize(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN);

/**
 * Middleware for routes accessible by technicians and admins
 */
export const technicianOrAdmin = authorize(USER_ROLES.TECHNICIAN, USER_ROLES.ADMIN);