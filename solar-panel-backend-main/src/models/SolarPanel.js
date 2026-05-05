import mongoose from 'mongoose';

/**
 * Solar Panel Schema
 * Manages solar panel products in the system
 */

const solarPanelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Panel name is required'],
      trim: true,
      maxlength: [100, 'Panel name cannot exceed 100 characters'],
    },
    capacityKW: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0.001, 'Capacity must be at least 0.001 KW (1 Watt)'],
      max: [1000, 'Capacity cannot exceed 1000 KW'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    suitableFor: {
      type: String,
      enum: {
        values: ['residential_basic', 'residential_pro', 'commercial'],
        message: 'Suitable for must be residential_basic, residential_pro, or commercial',
      },
      required: [true, 'Suitable for field is required'],
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
solarPanelSchema.index({ name: 'text', description: 'text' });
solarPanelSchema.index({ suitableFor: 1, isActive: 1 });
solarPanelSchema.index({ price: 1 });

const SolarPanel = mongoose.model('SolarPanel', solarPanelSchema);

export default SolarPanel;