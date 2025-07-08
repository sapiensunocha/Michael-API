import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getPartnerProfile } from '../api/backendApi';
import '../Dashboard.css'; // For shared navigation and general styles
import './Profile.css'; // Specific styles for the profile page
import {
  User, Key, Mail, Award, CheckCircle, XCircle, Edit, Globe, DollarSign, Settings,
  Search, Briefcase, ChevronRight
} from 'lucide-react'; // Icons

function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    async function fetchPartnerData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPartnerProfile(user.token);
        setPartnerData(data);
      } catch (err) {
        console.error('Error fetching partner data:', err);
        setError(err.message || 'Failed to fetch partner data.');
        if (err.message === 'Not authorized, token failed' || err.message === 'Not authorized, no token') {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPartnerData();
  }, [user, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Conditional rendering for API Key based on plan
  const hasApiKeyAccess = partnerData && (partnerData.plan_name === 'Premium' || partnerData.plan_name === 'Enterprise'); // Adjust based on your plan names

  return (
    <div className="profile-page-container">
      {/* Shared Navigation Bar (from Dashboard.jsx) */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <img src="/logo.png" alt="WDC Logo" className="logo" />
          <h1 className="app-title">WDC Partner Portal</h1>
        </div>
        <div className="nav-right">
          <button
            onClick={() => console.log('Search for Data clicked')} // Placeholder for search functionality
            className="nav-button search-button"
          >
            <Search className="icon-mr" size={18} /> Search Data
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="nav-button pricing-button"
          >
            <DollarSign className="icon-mr" size={18} /> View Pricing
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="nav-button dashboard-button"
          >
            <Globe className="icon-mr" size={18} /> Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="nav-button logout-button"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Profile Content */}
      <div className="profile-content">
        <div className="profile-header-section card">
          <User className="profile-header-icon" size={60} />
          <h2 className="profile-title">My Partner Profile</h2>
          <p className="profile-subtitle">Manage your account details and API access.</p>
        </div>

        {loading && <p className="loading-message">Loading profile data...</p>}
        {error && <p className="error-message">{error}</p>}

        {partnerData && (
          <div className="profile-details-grid">
            {/* Basic Info Card */}
            <div className="profile-card">
              <h3 className="profile-card-title"><User className="icon-mr" size={20} /> Personal Information</h3>
              <p><strong>Name:</strong> <span className="profile-value">{partnerData.name}</span></p>
              <p><strong>Contact Email:</strong> <span className="profile-value flex items-center"><Mail className="mr-2" size={16}/> {partnerData.contact_email}</span></p>
              <p><strong>Member Since:</strong> <span className="profile-value">{new Date(partnerData.created_at).toLocaleDateString()}</span></p>
              <button className="profile-card-button primary-button"><Edit className="icon-mr" size={16}/> Edit Profile</button>
            </div>

            {/* Subscription Info Card */}
            <div className="profile-card">
              <h3 className="profile-card-title"><Award className="icon-mr" size={20} /> Subscription Plan</h3>
              <p><strong>Current Plan:</strong> <span className={`profile-value plan-name status-${partnerData.plan_name ? partnerData.plan_name.toLowerCase() : 'n-a'}`}>{partnerData.plan_name || 'N/A'}</span></p>
              <p><strong>Status:</strong> <span className={`profile-value status-${partnerData.status ? partnerData.status.toLowerCase() : 'n-a'}`}>
                {partnerData.status === 'active' ? <CheckCircle className="inline-block mr-1 text-green-600" size={16}/> : <XCircle className="inline-block mr-1 text-red-600" size={16}/>}
                {partnerData.status || 'N/A'}
              </span></p>
              <button className="profile-card-button primary-button" onClick={() => navigate('/pricing')}>
                <DollarSign className="icon-mr" size={16}/> Manage Subscription
              </button>
            </div>

            {/* API Key Access Card */}
            <div className="profile-card api-key-card">
              <h3 className="profile-card-title"><Key className="icon-mr" size={20} /> API Access</h3>
              {hasApiKeyAccess ? (
                <div className="api-key-display">
                  <p className="api-key-label">Your API Key:</p>
                  <span className="api-key-value">{partnerData.api_key}</span>
                  <p className="api-key-note">Keep this key secure. Do not share it publicly.</p>
                  <button className="profile-card-button secondary-button">Generate New Key</button>
                </div>
              ) : (
                <div className="api-key-upgrade-message">
                  <p>Upgrade your plan to unlock API capabilities and access advanced data.</p>
                  <button className="profile-card-button primary-button" onClick={() => navigate('/pricing')}>
                    <DollarSign className="icon-mr" size={16}/> Upgrade Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !partnerData && !error && (
          <p className="no-profile-message">No profile data available. Please ensure you are logged in.</p>
        )}
      </div>

      {/* Shared Footer (from Dashboard.jsx) */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} World Disaster Center. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Profile;
