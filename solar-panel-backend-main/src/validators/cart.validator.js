import mongoose from 'mongoose';

/**
 * Cart Request Validators
 */

export const validateAddToCart = (req, res, next) => {
  const { solarPanelId, quantity } = req.body;
  const errors = [];

  // Solar panel ID validation
  if (!solarPanelId) {
    errors.push('Solar panel ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(solarPanelId)) {
    errors.push('Invalid solar panel ID format');
  }

  // Quantity validation
  if (quantity !== undefined) {
    if (isNaN(quantity)) {
      errors.push('Quantity must be a number');
    } else if (quantity < 1) {
      errors.push('Quantity must be at least 1');
    }
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

export const validatePanelId = (req, res, next) => {
  const { panelId } = req.params;
  const errors = [];

  if (!panelId) {
    errors.push('Panel ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(panelId)) {
    errors.push('Invalid panel ID format');
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