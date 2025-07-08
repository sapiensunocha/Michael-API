const express = require('express');
const { createCheckoutSession, getPlans } = require('../controllers/paymentController'); // Import getPlans
const { protect } = require('../middlewares/authMiddleware'); // Corrected import path for 'protect' middleware

const router = express.Router();

// Route to create a Stripe checkout session.
// It is protected, meaning only authenticated users can access it.
router.post('/create-session', protect, createCheckoutSession);

// Route to get all available subscription plans.
// It is protected, meaning only authenticated users can access it.
router.get('/plans', protect, getPlans); // New route to fetch plans

module.exports = router;
