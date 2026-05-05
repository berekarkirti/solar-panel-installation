import Stripe from 'stripe';

/**
 * Stripe Configuration
 * Initialize Stripe with secret key
 */

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  Warning: STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use latest stable API version
});

export const stripeCurrency = process.env.STRIPE_CURRENCY || 'INR';

export default stripe;