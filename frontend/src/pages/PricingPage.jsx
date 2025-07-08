import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Corrected path: Go up one level to 'src', then into 'context'
import { getPlans } from '../api/backendApi'; // Corrected path: Go up one level to 'src', then into 'api'
import Payment from '../Payment'; // Corrected path: Go up one level to 'src'
import '../PricingPage.css'; // Corrected path: Go up one level to 'src' for PricingPage.css

function PricingPage() {
  const { user, logout } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    async function fetchPlans() {
      setLoading(true);
      setError(null);
      try {
        const fetchedPlans = await getPlans(user.token);
        // Sort plans by price, free first, then ascending price
        fetchedPlans.sort((a, b) => {
          if (a.id === 'free') return -1;
          if (b.id === 'free') return 1;
          return a.price - b.price;
        });
        setPlans(fetchedPlans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError(err.message || 'Failed to fetch pricing plans.');
        if (err.message === 'Not authorized, token failed' || err.message === 'Not authorized, no token') {
          logout(); // Log out if token is invalid
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, [user, navigate, logout]);

  return (
    <div className="pricing-page-container">
      <div className="pricing-header">
        <h2>Choose Your Plan</h2>
        <p>Select the best plan that fits your organization's needs.</p>
        <button onClick={() => navigate('/dashboard')} className="back-to-dashboard-button">
          Back to Dashboard
        </button>
      </div>

      {loading && <p className="loading-message">Loading plans...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="plans-grid">
        {!loading && !error && plans.length === 0 && (
          <p className="no-plans-message">No pricing plans available at the moment. Please check back later.</p>
        )}

        {!loading && !error && plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.plan_name}</h3>
            <p className="plan-price">
              {plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(2)} / month`}
            </p>
            <p className="plan-description">{plan.description}</p>
            <ul className="plan-features">
              {plan.features && plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {/* Render Payment component for each plan, passing necessary props */}
            {plan.id !== 'free' ? (
              <Payment planId={plan.id} price={plan.price} planName={plan.plan_name} />
            ) : (
              <button disabled className="current-plan-button">Current Plan</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingPage;
