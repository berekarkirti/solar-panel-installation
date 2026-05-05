import mongoose from 'mongoose';
import { INSTALLATION_STATUS_VALUES } from '../constants/installationStatus.js';

/**
 * Installation Request Validators
 */

export const validateAssignTechnician = (req, res, next) => {
  const { orderId, technicianId } = req.body;
  const errors = [];

  if (!orderId) {
    errors.push('Order ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(orderId)) {
    errors.push('Invalid order ID format');
  }

  if (!technicianId) {
    errors.push('Technician ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    errors.push('Invalid technician ID format');
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

export const validateUpdateStatus = (req, res, next) => {
  const { status } = req.body;
  const errors = [];

  if (!status) {
    errors.push('Status is required');
  } else if (!INSTALLATION_STATUS_VALUES.includes(status)) {
    errors.push(`Status must be one of: ${INSTALLATION_STATUS_VALUES.join(', ')}`);
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

export const validateInstallationId = (req, res, next) => {
  const { id } = req.params;
  const errors = [];

  if (!id) {
    errors.push('Installation ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(id)) {
    errors.push('Invalid installation ID format');
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