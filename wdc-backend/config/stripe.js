const Stripe = require('stripe');
require('dotenv').config(); // Ensure environment variables are loaded

// Initialize Stripe with your secret key from environment variables.
// This key should start with 'sk_test_' for test mode or 'sk_live_' for live mode.
// It is crucial to keep this key secret and never expose it to the frontend.
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
