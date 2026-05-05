import mongoose from 'mongoose';

/**
 * Review Schema
 * Customer reviews and ratings for completed installations
 */

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false, // Optional now
    },
    solarPanel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SolarPanel',
      required: false,
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
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying customer reviews
reviewSchema.index({ customer: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;