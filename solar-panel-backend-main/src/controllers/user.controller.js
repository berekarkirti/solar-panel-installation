import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * User Management Controller
 * Handles CRUD operations for users (Admin only)
 */
class UserController {
    /**
     * Get all users with optional role filter
     * @route GET /api/v1/users
     * @query role - Optional role filter (CUSTOMER, TECHNICIAN)
     */
    async getAllUsers(req, res, next) {
        try {
            const { role, search, page = 1, limit = 20 } = req.query;

            const query = {};

            // Filter by role if provided
            if (role && ['CUSTOMER', 'TECHNICIAN'].includes(role.toUpperCase())) {
                query.role = role.toUpperCase();
            } else {
                // Only show customers and technicians, not admins
                query.role = { $in: ['CUSTOMER', 'TECHNICIAN'] };
            }

            // Search by name or email
            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [users, total] = await Promise.all([
                User.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                User.countDocuments(query),
            ]);

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: Math.ceil(total / parseInt(limit)),
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single user by ID
     * @route GET /api/v1/users/:id
     */
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findById(id).lean();

            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            // Don't allow viewing admin details
            if (user.role === 'ADMIN') {
                const error = new Error('Access denied');
                error.statusCode = 403;
                throw error;
            }

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create a new technician
     * @route POST /api/v1/users/technicians
     * Admin can ONLY create technicians, not customers
     */
    async createTechnician(req, res, next) {
        try {
            const { email, password, firstName, lastName, phoneNumber } = req.body;

            // Check if email already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                const error = new Error('Email already registered');
                error.statusCode = 400;
                throw error;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create technician
            const technician = await User.create({
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'TECHNICIAN',
                firstName,
                lastName,
                phoneNumber,
                isActive: true,
            });

            const userResponse = technician.toSafeObject();

            res.status(201).json({
                success: true,
                message: 'Technician created successfully',
                data: { user: userResponse },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a technician
     * @route PUT /api/v1/users/technicians/:id
     * Admin can ONLY update technicians, not customers
     */
    async updateTechnician(req, res, next) {
        try {
            const { id } = req.params;
            const { firstName, lastName, phoneNumber, isActive, password } = req.body;

            const user = await User.findById(id);

            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            // Only technicians can be updated by admin
            if (user.role !== 'TECHNICIAN') {
                const error = new Error('Only technicians can be updated');
                error.statusCode = 403;
                throw error;
            }

            // Update fields
            if (firstName !== undefined) user.firstName = firstName;
            if (lastName !== undefined) user.lastName = lastName;
            if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
            if (isActive !== undefined) user.isActive = isActive;

            // Update password if provided
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Technician updated successfully',
                data: { user: user.toSafeObject() },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a technician
     * @route DELETE /api/v1/users/technicians/:id
     * Admin can ONLY delete technicians, not customers
     */
    async deleteTechnician(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findById(id);

            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            // Only technicians can be deleted by admin
            if (user.role !== 'TECHNICIAN') {
                const error = new Error('Only technicians can be deleted');
                error.statusCode = 403;
                throw error;
            }

            await User.findByIdAndDelete(id);

            res.status(200).json({
                success: true,
                message: 'Technician deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Toggle user active status
     * @route PATCH /api/v1/users/:id/toggle-status
     * Works for technicians only
     */
    async toggleUserStatus(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findById(id);

            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            // Only technicians can have status toggled by admin
            if (user.role !== 'TECHNICIAN') {
                const error = new Error('Only technician status can be toggled');
                error.statusCode = 403;
                throw error;
            }

            user.isActive = !user.isActive;
            await user.save();

            res.status(200).json({
                success: true,
                message: `Technician ${user.isActive ? 'activated' : 'deactivated'} successfully`,
                data: { user: user.toSafeObject() },
            });
        } catch (error) {
            next(error);
        }
    }
}

const userController = new UserController();
export default userController;
