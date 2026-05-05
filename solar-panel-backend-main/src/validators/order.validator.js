import mongoose from 'mongoose';

/**
 * Order Request Validators
 */

export const validateOrderId = (req, res, next) => {
  const { id } = req.params;
  const errors = [];

  if (!id) {
    errors.push('Order ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(id)) {
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

export const validateCreateOrder = (req, res, next) => {
  const { address, city } = req.body;
  const errors = [];

  if (!address || address.trim() === '') {
    errors.push('Shipping address is required');
  }

  if (!city || city.trim() === '') {
    errors.push('City is required');
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