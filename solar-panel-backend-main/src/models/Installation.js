import mongoose from 'mongoose';
import { INSTALLATION_STATUS_VALUES } from '../constants/installationStatus.js';

/**
 * Installation Schema
 * Tracks solar panel installation assignments and progress
 */

const installationSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // One installation per order
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: INSTALLATION_STATUS_VALUES,
        message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED',
      },
      default: 'PENDING',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying technician assignments
installationSchema.index({ technician: 1, status: 1 });

const Installation = mongoose.model('Installation', installationSchema);

export default Installation;