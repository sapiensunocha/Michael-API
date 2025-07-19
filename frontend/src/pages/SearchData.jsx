import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../Dashboard.css'; // For shared navigation and general styles
import './SearchData.css'; // Specific styles for this page

import { Search, Globe, User, DollarSign, Settings, ChevronLeft } from 'lucide-react';

function SearchData() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="search-page-container">
      {/* Shared Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <img src="/logo.png" alt="WDC Logo" className="logo" />
          <h1 className="app-title">WDC Partner Portal</h1>
        </div>
        <div className="nav-right">
          <button
            onClick={() => navigate('/dashboard')}
            className="nav-button dashboard-button"
          >
            <Globe className="icon-mr" size={18} /> Dashboard
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="nav-button pricing-button"
          >
            <DollarSign className="icon-mr" size={18} /> View Pricing
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="nav-button profile-button"
          >
            <User className="icon-mr" size={18} /> Profile
          </button>
          <button
            onClick={handleLogout}
            className="nav-button logout-button"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="search-content">
        <div className="search-header-section card">
          <Search className="search-header-icon" size={60} />
          <h2 className="search-title">Search WDC Data</h2>
          <p className="search-subtitle">Explore our comprehensive database of global disaster information.</p>
          <button onClick={() => navigate('/dashboard')} className="back-to-dashboard-button primary-button">
            <ChevronLeft size={18} className="icon-mr" /> Back to Dashboard
          </button>
        </div>

        <div className="search-form-section card">
          <h3 className="card-title">Enter Your Search Query</h3>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="e.g., 'Flood in Quebec', 'Wildfire trends', 'Earthquake impact'"
              className="search-input"
            />
            <button className="search-submit-button primary-button">
              <Search size={20} className="icon-mr" /> Search
            </button>
          </div>
          <p className="search-note">
            (Search functionality is under development. This is a placeholder for future features.)
          </p>
        </div>

        <div className="search-results-section card">
          <h3 className="card-title">Search Results</h3>
          <p className="no-results-message">
            Your search results will appear here.
          </p>
        </div>
      </div>

      {/* Shared Footer */}
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

export default SearchData;
