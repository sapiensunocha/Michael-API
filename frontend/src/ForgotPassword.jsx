// frontend/src/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from './api/backendApi'; // Import the new API function
import './Login.css'; // Reuse the styling from Login for consistency

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null); // To show success or error messages
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setMessage('If an account with that email exists, a password reset link has been sent to your inbox.');
      setEmail(''); // Clear the input field
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container"> {/* Reusing login-container for centered layout */}
      <div className="login-card"> {/* Reusing login-card for consistent styling */}
        <img src="/logo.png" alt="Michael API Logo" className="login-logo" />
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          {message && <p className="success-message">{message}</p>} {/* Style this in Login.css if needed */}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="register-link"> {/* Reusing register-link class for consistent styling */}
          Remember your password? <span onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;