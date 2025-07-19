import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../Dashboard.css'; // For shared navigation and general styles
import './InteractiveMap.css'; // Specific styles for this page

import { Globe, User, DollarSign, Settings, Search, ChevronLeft } from 'lucide-react';

function InteractiveMap() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="map-page-container">
      {/* Shared Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <img src="/logo.png" alt="WDC Logo" className="logo" />
          <h1 className="app-title">WDC Partner Portal</h1>
        </div>
        <div className="nav-right">
          <button
            onClick={() => navigate('/search-data')}
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
      <div className="interactive-map-content">
        <div className="interactive-map-header-section card">
          <Globe className="interactive-map-header-icon" size={60} />
          <h2 className="interactive-map-title">Global Disaster Map</h2>
          <p className="interactive-map-subtitle">Visualize real-time alerts and humanitarian hotspots worldwide.</p>
          <button onClick={() => navigate('/dashboard')} className="back-to-dashboard-button primary-button">
            <ChevronLeft size={18} className="icon-mr" /> Back to Dashboard
          </button>
        </div>

        <div className="map-display-area card">
          <h3 className="card-title">Interactive Map View</h3>
          <div className="map-container-placeholder">
            {/* This is where a real interactive map (e.g., Leaflet, Mapbox) would be embedded */}
            <img
              src="https://placehold.co/1000x600/001f52/e6f7ff?text=Full+Interactive+Map+Coming+Soon"
              alt="Interactive Map Placeholder"
              className="full-map-placeholder-image"
            />
            <p className="map-integration-note">
              (A fully interactive map with live data, filtering, and detailed overlays will be integrated here.)
            </p>
          </div>
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

export default InteractiveMap;
