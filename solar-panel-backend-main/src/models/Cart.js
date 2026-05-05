import mongoose from 'mongoose';

/**
 * Cart Schema
 * Manages customer shopping cart
 */

const cartItemSchema = new mongoose.Schema(
  {
    solarPanel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SolarPanel',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false } // Disable auto _id for subdocuments
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
      index: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate total amount
cartSchema.methods.calculateTotal = function () {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.solarPanel.price * item.quantity);
  }, 0);
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;