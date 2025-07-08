const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhookController');

const router = express.Router();

// @desc Handle Stripe webhook events
// @route POST /api/webhooks
// @access Public (Stripe sends these, they are secured by Stripe-Signature header)
// IMPORTANT: This route MUST use express.raw() for body parsing in server.js
// before express.json() so the raw body is available for Stripe signature verification.
router.post('/', handleStripeWebhook);

module.exports = router;
