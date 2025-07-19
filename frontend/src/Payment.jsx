import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext'; // Adjust path if needed
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Payment.css'; // Styling for Payment component

// --- IMPORTANT: Replace with your actual Stripe publishable key (starts with pk_test_...) ---
// It's best to load this from an environment variable (e.g., process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

// This component handles the actual Stripe payment form and submission
const CheckoutForm = ({ planId, price, planName, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // You will need a new backend API call for this:
  // Function to create a Payment Intent on your Supabase Edge Function
  const createPaymentIntent = async (token, pId, amount) => {
    try {
      const response = await fetch('http://localhost:54321/functions/v1/create-payment-intent', { // Adjust URL if not local
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: pId,
          amount: amount, // Amount in cents
          currency: 'usd'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent on backend.');
      }

      return { clientSecret: data.clientSecret, error: null };
    } catch (err) {
      console.error('Error creating payment intent:', err);
      return { clientSecret: null, error: err.message || 'Failed to connect to backend.' };
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !user || !user.token) {
      // Stripe.js has not yet loaded or user not logged in
      setMessage('Stripe is not loaded or you are not logged in.');
      onError('Stripe is not loaded or you are not logged in.');
      return;
    }

    setLoading(true);
    setMessage(null);
    onError(null);

    try {
      // 1. Call your new backend function to create a PaymentIntent
      const { clientSecret, error: backendError } = await createPaymentIntent(
        user.token,
        planId,
        price // Pass price in cents
      );

      if (backendError) {
        throw new Error(backendError);
      }

      // 2. Confirm the payment on the client side using the clientSecret
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          // This is the URL Stripe will redirect to after the payment is completed or fails.
          // You'll likely want to update your user's status here or via a webhook.
          return_url: `${window.location.origin}/dashboard?payment=status`,
        },
      });

      if (stripeError) {
        // Show error to your customer (e.g., invalid card details)
        if (stripeError.type === 'card_error' || stripeError.type === 'validation_error') {
          setMessage(stripeError.message);
          onError(stripeError.message);
        } else {
          setMessage('An unexpected error occurred during payment processing.');
          onError('An unexpected error occurred during payment processing.');
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment Succeeded! Your subscription status will be updated shortly.');
        onError(null); // Clear error on success
        // At this point, Stripe will send a webhook event to your backend.
        // Your webhook handler function will then update the user's subscription in Supabase.
        // You might redirect the user to a "Thank You" or "Loading" page here.
      }
    } catch (err) {
      console.error('Error in payment process:', err);
      setMessage(err.message || 'Failed to process payment. Please try again.');
      onError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button
        disabled={loading || !stripe || !elements || !user}
        id="submit"
        className="subscribe-button"
      >
        <span id="button-text">
          {loading ? 'Processing...' : `Pay for ${planName}`}
        </span>
      </button>
      {message && <div id="payment-message" className="error-message">{message}</div>}
    </form>
  );
};

// Main Payment component that wraps CheckoutForm with Stripe Elements provider
function Payment({ planId, price, planName }) {
  const [error, setError] = useState(null); // Error for the outer component

  // Options for the PaymentElement (amount and currency are crucial)
  const options = {
    mode: 'payment',
    amount: price, // Amount in cents (e.g., 2000 for $20.00)
    currency: 'usd',
    appearance: {
      theme: 'stripe', // 'stripe' or 'flat' or 'none'
      variables: {
        colorPrimary: '#6366F1', // Your brand color
      }
    }
  };

  // Ensure user is logged in before rendering the payment form
  const { user } = useContext(AuthContext);
  if (!user) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h3>Subscribe to {planName}</h3>
          <p className="plan-price">${(price / 100).toFixed(2)} / month</p>
          <p className="login-prompt">Please log in to subscribe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h3>Subscribe to {planName}</h3>
        <p className="plan-price">${(price / 100).toFixed(2)} / month</p>
        {error && <p className="error-message">{error}</p>}
        {/* Elements provider must wrap the component using useStripe and useElements */}
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            planId={planId}
            price={price}
            planName={planName}
            onError={setError} // Callback to pass errors from CheckoutForm to parent
          />
        </Elements>
      </div>
    </div>
  );
}

export default Payment;