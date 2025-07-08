const stripe = require('../config/stripe'); // Stripe configured client
const logger = require('../config/logger'); // Logger
const supabase = require('../config/supabaseClient'); // Supabase client

/**
 * @desc Creates a Stripe checkout session for a given subscription plan.
 * @route POST /api/payments/create-session
 * @access Private (requires authentication)
 */
const createCheckoutSession = async (req, res) => {
  const { planId, success_url, cancel_url } = req.body;
  const userId = req.user.id;

  // 🔍 Debug: Log the incoming planId
  console.log('🧪 Received planId from frontend:', planId);

  if (!planId || !success_url || !cancel_url) {
    logger.warn('Missing required fields for checkout session.');
    return res.status(400).json({ error: 'Missing required fields: planId, success_url, and cancel_url.' });
  }

  try {
    // 1. Fetch plan from Supabase
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('stripe_price_id, plan_name, price') // ✅ FIXED: changed 'name' to 'plan_name'
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      logger.error(`Failed to fetch plan with ID ${planId}: ${planError ? planError.message : 'Not found'}`);
      return res.status(404).json({ error: `Subscription plan with ID ${planId} not found.` });
    }

    // 2. Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    let customerEmail = null;
    if (user && !userError) customerEmail = user.email;
    else logger.warn(`User email not found for ID ${userId}`);

    // 3. Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url,
      cancel_url,
      ...(customerEmail && { customer_email: customerEmail }),
      metadata: { userId, planId },
    });

    res.json({ url: session.url });

  } catch (err) {
    logger.error(`Stripe session error: ${err.message}`);
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
};

/**
 * @desc Fetches all available subscription plans from the database.
 * @route GET /api/payments/plans
 * @access Private (requires authentication)
 */
const getPlans = async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('plans')
      .select('id, plan_name, description, price, quota_limit, features, stripe_price_id, stripe_product_id');

    if (error) {
      logger.error(`Error fetching plans: ${error.message}`);
      return res.status(500).json({ error: 'Failed to retrieve plans.' });
    }

    res.json(plans);
  } catch (err) {
    logger.error(`Server error fetching plans: ${err.message}`);
    res.status(500).json({ error: 'Server error fetching plans.' });
  }
};

module.exports = { createCheckoutSession, getPlans };