import mongoose from 'mongoose';

/**
 * Review Request Validators
 */

export const validateAddReview = (req, res, next) => {
  const { orderId, solarPanelId, rating, comment } = req.body;
  const errors = [];

  // Target ID validation
  if (!orderId && !solarPanelId) {
    errors.push('Either Order ID or Solar Panel ID is required');
  }

  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    errors.push('Invalid order ID format');
  }

  if (solarPanelId && !mongoose.Types.ObjectId.isValid(solarPanelId)) {
    errors.push('Invalid solar panel ID format');
  }

  // Rating validation
  if (rating === undefined || rating === null) {
    errors.push('Rating is required');
  } else if (!Number.isInteger(rating)) {
    errors.push('Rating must be an integer');
  } else if (rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  // Comment validation (optional)
  if (comment !== undefined && typeof comment !== 'string') {
    errors.push('Comment must be a string');
  }

  if (comment && comment.length > 500) {
    errors.push('Comment cannot exceed 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};