import mongoose from 'mongoose';

/**
 * Payment Request Validators
 */

export const validateCreateIntent = (req, res, next) => {
  const { orderId } = req.body;
  const errors = [];

  if (!orderId) {
    errors.push('Order ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(orderId)) {
    errors.push('Invalid order ID format');
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

export const validateConfirmPayment = (req, res, next) => {
  const { orderId, paymentIntentId } = req.body;
  const errors = [];

  if (!orderId) {
    errors.push('Order ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(orderId)) {
    errors.push('Invalid order ID format');
  }

  if (!paymentIntentId) {
    errors.push('Payment intent ID is required');
  } else if (typeof paymentIntentId !== 'string' || paymentIntentId.trim() === '') {
    errors.push('Payment intent ID must be a non-empty string');
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