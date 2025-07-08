const express = require('express');
const { 
  getPartnerProfile, 
  updatePartnerPlan,
  getGlobalDashboardData, // Import the new function
  getTrendingInsights     // Import the new function
} = require('../controllers/partnerController');
const { protect, admin } = require('../middlewares/authMiddleware'); // Import protect and admin middleware

const router = express.Router();

// @desc Get partner profile (current user's partner info)
// @route GET /api/partners/profile
// @access Private (requires authentication)
router.get('/profile', protect, getPartnerProfile);

// @desc Get global dashboard summary data
// @route GET /api/partners/dashboard/global-summary
// @access Private (requires authentication)
router.get('/dashboard/global-summary', protect, getGlobalDashboardData);

// @desc Get trending insights for the dashboard
// @route GET /api/partners/dashboard/trending-insights
// @access Private (requires authentication)
router.get('/dashboard/trending-insights', protect, getTrendingInsights);

// @desc Update partner's subscription plan
// @route PUT /api/partners/:id/plan
// @access Private/Admin (requires authentication and admin role for general updates,
// or can be restricted to the user themselves for self-service upgrades)
// For simplicity, we'll make this admin-only for now, but you can adjust logic in controller
router.put('/:id/plan', protect, admin, updatePartnerPlan); // Example: Admin can update any partner's plan

module.exports = router;
