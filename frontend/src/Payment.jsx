import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext'; // Adjust path if needed
import { createCheckoutSession } from './api/backendApi'; // Adjust path if needed
import './Payment.css'; // Styling for Payment component

function Payment({ planId, price, planName }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    if (!user || !user.token) {
      setError('You must be logged in to subscribe.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const successUrl = `${window.location.origin}/dashboard?payment=success`;
      const cancelUrl = `${window.location.origin}/pricing?payment=cancelled`;

      const { url } = await createCheckoutSession(user.token, planId, successUrl, cancelUrl);

      if (url) {
        window.location.href = url;
      } else {
        setError('Failed to get a valid checkout URL from the backend.');
      }
    } catch (err) {
      console.error('Error initiating checkout session:', err);
      setError(err.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h3>Subscribe to {planName}</h3>
        <p className="plan-price">${(price / 100).toFixed(2)} / month</p>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleSubscribe} disabled={loading || !user} className="subscribe-button">
          {loading ? 'Redirecting to Stripe...' : `Subscribe to ${planName}`}
        </button>
        {!user && <p className="login-prompt">Please log in to subscribe.</p>}
      </div>
    </div>
  );
}

export default Payment;