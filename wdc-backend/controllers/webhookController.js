const stripe = require('../config/stripe'); // Stripe client for API calls and webhook construction
const supabase = require('../config/supabaseClient'); // Supabase client for database interactions
const logger = require('../config/logger'); // Logger for error and info messages

// Get Stripe webhook secret from environment variables
// IMPORTANT: This must match the webhook secret configured in your Stripe Dashboard.
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * @desc Handles incoming Stripe webhook events.
 * This function verifies the event's signature and processes different event types
 * to update the application's database (Supabase).
 * @route POST /api/webhooks
 * @access Public (secured by Stripe signature)
 * @param {Object} req - The request object, with rawBody available from express.raw().
 * @param {Object} res - The response object.
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']; // Get the Stripe signature from the request headers
  let event;

  try {
    // Construct the event using the raw body and the webhook secret.
    // This verifies the event's authenticity.
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    logger.error(`Stripe webhook signature verification failed: ${err.message}`);
    // If verification fails, return a 400 Bad Request
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'checkout.session.completed':
      // This event occurs when a customer successfully completes a Stripe Checkout Session.
      // It's a good place to provision access to your product/service.
      const checkoutSession = event.data.object;
      logger.info(`Checkout Session Completed: ${checkoutSession.id}`);

      // Extract metadata attached during session creation (userId, planId)
      const userIdFromMetadata = checkoutSession.metadata.userId;
      const planIdFromMetadata = checkoutSession.metadata.planId;
      const customerId = checkoutSession.customer; // Stripe Customer ID
      const subscriptionId = checkoutSession.subscription; // Stripe Subscription ID

      if (!userIdFromMetadata || !planIdFromMetadata) {
        logger.error(`Missing metadata in checkout.session.completed for session ${checkoutSession.id}. userId: ${userIdFromMetadata}, planId: ${planIdFromMetadata}`);
        return res.status(400).send('Missing required metadata in checkout session.');
      }

      try {
        // Fetch the plan name from your 'plans' table using the planId
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('name')
          .eq('id', planIdFromMetadata)
          .single();

        if (planError || !plan) {
          logger.error(`Plan not found for ID ${planIdFromMetadata} during checkout.session.completed. Error: ${planError ? planError.message : 'No plan data.'}`);
          // Still acknowledge webhook to Stripe, but log the issue
          return res.status(200).json({ received: true });
        }

        // Update the partner's record in Supabase
        const { data: updatedPartner, error: updateError } = await supabase
          .from('partners')
          .update({
            plan_name: plan.name, // Set the new plan name
            status: 'active', // Set status to active
            stripe_customer_id: customerId, // Store Stripe Customer ID
            stripe_subscription_id: subscriptionId, // Store Stripe Subscription ID
            // You might also want to store checkoutSession.id for tracking
          })
          .eq('user_id', userIdFromMetadata)
          .select();

        if (updateError || !updatedPartner) {
          logger.error(`Failed to update partner (user_id: ${userIdFromMetadata}) after checkout.session.completed: ${updateError ? updateError.message : 'Partner not found.'}`);
        } else {
          logger.info(`Partner ${updatedPartner[0].id} (user_id: ${userIdFromMetadata}) plan updated to ${plan.name} via webhook.`);
        }

      } catch (dbErr) {
        logger.error(`Database error processing checkout.session.completed for session ${checkoutSession.id}: ${dbErr.message}`);
      }
      break;

    case 'customer.subscription.updated':
      // This event occurs when a customer's subscription is updated (e.g., plan change, renewal, cancellation).
      const subscription = event.data.object;
      logger.info(`Customer Subscription Updated: ${subscription.id}`);

      const stripeCustomerId = subscription.customer;
      const newPlanId = subscription.items.data[0].price.id; // Get the new Stripe Price ID
      const newSubscriptionStatus = subscription.status; // Get the new subscription status

      try {
        // Find the corresponding plan name in your 'plans' table using the Stripe Price ID
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('name')
          .eq('stripe_price_id', newPlanId)
          .single();

        let planName = 'unknown';
        if (planError || !plan) {
          logger.warn(`Plan not found for Stripe Price ID ${newPlanId} during customer.subscription.updated. Error: ${planError ? planError.message : 'No plan data.'}`);
        } else {
          planName = plan.name;
        }

        // Update the partner's record in Supabase based on the Stripe Customer ID
        const { data: updatedPartner, error: updateError } = await supabase
          .from('partners')
          .update({
            plan_name: planName, // Update to the new plan name
            status: newSubscriptionStatus, // Update to the new subscription status
          })
          .eq('stripe_customer_id', stripeCustomerId) // Match by Stripe Customer ID
          .select();

        if (updateError || !updatedPartner) {
          logger.error(`Failed to update partner (stripe_customer_id: ${stripeCustomerId}) after customer.subscription.updated: ${updateError ? updateError.message : 'Partner not found.'}`);
        } else {
          logger.info(`Partner ${updatedPartner[0].id} (stripe_customer_id: ${stripeCustomerId}) plan updated to ${planName} with status ${newSubscriptionStatus} via webhook.`);
        }

      } catch (dbErr) {
        logger.error(`Database error processing customer.subscription.updated for subscription ${subscription.id}: ${dbErr.message}`);
      }
      break;

    case 'customer.subscription.deleted':
      // This event occurs when a subscription is cancelled or ends.
      const deletedSubscription = event.data.object;
      logger.info(`Customer Subscription Deleted: ${deletedSubscription.id}`);

      const deletedStripeCustomerId = deletedSubscription.customer;

      try {
        // Update the partner's status to 'cancelled' or 'inactive'
        const { data: updatedPartner, error: updateError } = await supabase
          .from('partners')
          .update({
            status: 'cancelled', // Or 'inactive', depending on your business logic
            // Optionally clear stripe_subscription_id or set plan_name to 'free'
          })
          .eq('stripe_customer_id', deletedStripeCustomerId)
          .select();

        if (updateError || !updatedPartner) {
          logger.error(`Failed to update partner (stripe_customer_id: ${deletedStripeCustomerId}) after customer.subscription.deleted: ${updateError ? updateError.message : 'Partner not found.'}`);
        } else {
          logger.info(`Partner ${updatedPartner[0].id} (stripe_customer_id: ${deletedStripeCustomerId}) status updated to 'cancelled' via webhook.`);
        }

      } catch (dbErr) {
        logger.error(`Database error processing customer.subscription.deleted for subscription ${deletedSubscription.id}: ${dbErr.message}`);
      }
      break;

    // Add more cases for other event types you want to handle (e.g., 'invoice.payment_succeeded', 'invoice.payment_failed')
    default:
      logger.warn(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event to Stripe
  res.status(200).json({ received: true });
};

module.exports = { handleStripeWebhook };
