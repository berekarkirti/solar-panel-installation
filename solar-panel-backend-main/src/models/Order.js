import mongoose from 'mongoose';

/**
 * Order Schema
 * Stores customer orders created from cart
 */

const orderItemSchema = new mongoose.Schema(
  {
    solarPanel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SolarPanel',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    shippingAddress: {
      address: {
        type: String,
        required: [true, 'Shipping address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'PAID', 'CANCELLED'],
        message: 'Status must be PENDING, PAID, or CANCELLED',
      },
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying user orders
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;