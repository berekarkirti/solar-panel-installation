import { loadStripe } from '@stripe/stripe-js';

/**
 * Stripe Configuration
 * Initialize Stripe with publishable key
 * 
 * IMPORTANT: Use your Stripe PUBLISHABLE key here (starts with pk_test_ or pk_live_)
 * This is safe to include in frontend code - it's meant to be public
 */

// Get the publishable key from environment variables
// For Vite projects, environment variables must be prefixed with VITE_
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
    console.warn(
        '⚠️ Warning: VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables.\n' +
        'Please add it to your .env file: VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here'
    );
}

// Load Stripe - this returns a Promise
export const stripePromise = loadStripe(stripePublishableKey || '');

// Currency configuration (should match backend)
export const STRIPE_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

export default stripePromise;
