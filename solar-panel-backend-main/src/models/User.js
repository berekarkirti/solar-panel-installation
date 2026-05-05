import mongoose from 'mongoose';
import validator from 'validator';
import { ROLE_VALUES, USER_ROLES } from '../constants/roles.js';

/**
 * User Schema
 * Base schema for all user types in the system
 */

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Please provide a valid email address',
      },
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password is required only if googleId is not present
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Exclude password by default in queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/missing values
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ROLE_VALUES,
        message: `Role must be one of: ${ROLE_VALUES.join(', ')}`,
      },
      required: [true, 'User role is required'],
      default: USER_ROLES.CUSTOMER,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          return /^\d{10}$/.test(value);
        },
        message: 'Phone number must be exactly 10 digits',
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters'],
    },
    profileImage: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password; // Remove password from JSON responses
        delete ret.__v; // Remove version key
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ═══════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════

// Compound index for filtering active users by role
userSchema.index({ role: 1, isActive: 1 });

// Text search index for name and email
userSchema.index({ email: 'text', firstName: 'text', lastName: 'text' });

// ═══════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════

// Full name virtual property
userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// ═══════════════════════════════════════════════════════
// METHODS (Instance Methods)
// ═══════════════════════════════════════════════════════

/**
 * Check if user is admin
 * @returns {boolean}
 */
userSchema.methods.isAdmin = function () {
  return this.role === USER_ROLES.ADMIN;
};

/**
 * Check if user is customer
 * @returns {boolean}
 */
userSchema.methods.isCustomer = function () {
  return this.role === USER_ROLES.CUSTOMER;
};

/**
 * Check if user is technician
 * @returns {boolean}
 */
userSchema.methods.isTechnician = function () {
  return this.role === USER_ROLES.TECHNICIAN;
};

/**
 * Get safe user object (without sensitive data)
 * @returns {Object}
 */
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// ═══════════════════════════════════════════════════════
// STATICS (Model Methods)
// ═══════════════════════════════════════════════════════

/**
 * Find user by email
 * @param {string} email
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find active users by role
 * @param {string} role
 * @returns {Promise<User[]>}
 */
userSchema.statics.findActiveByRole = function (role) {
  return this.find({ role, isActive: true });
};

/**
 * Count users by role
 * @param {string} role
 * @returns {Promise<number>}
 */
userSchema.statics.countByRole = function (role) {
  return this.countDocuments({ role, isActive: true });
};

// ═══════════════════════════════════════════════════════
// MIDDLEWARE (Hooks)
// ═══════════════════════════════════════════════════════

// Pre-save hook - Hash password if modified
userSchema.pre('save', async function () {
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }

  // // Hash password only if it's modified (or new)
  // if (this.isModified('password')) {
  //   // Password hashing is now handled in authService
  //   // This hook is kept for future custom logic
  // }
});

// // Post-save hook (example: logging)
// userSchema.post('save', function (doc) {
//   console.log(`✅ User saved: ${doc.email} (${doc.role})`);
// });

// ═══════════════════════════════════════════════════════
// MODEL EXPORT
// ═══════════════════════════════════════════════════════

const User = mongoose.model('User', userSchema);

export default User;