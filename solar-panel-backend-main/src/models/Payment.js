import mongoose from 'mongoose';
import { PAYMENT_STATUS_VALUES } from '../constants/paymentStatus.js';

/**
 * Payment Schema
 * Stores payment records for orders
 */

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: PAYMENT_STATUS_VALUES,
        message: 'Status must be CREATED, SUCCESS, or FAILED',
      },
      default: 'CREATED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying user payments
paymentSchema.index({ user: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;