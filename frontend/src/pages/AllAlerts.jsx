import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getGlobalDashboardData } from '../api/backendApi';
import '../Dashboard.css';
import './AllAlerts.css';

import {
  Bell,
  Globe,
  User,
  DollarSign,
  Search,
  ChevronLeft,
  Zap,
  Activity,
  Info,
  MessageSquare
} from 'lucide-react';

function AllAlerts() {
  const { user, logout } = useContext(AuthContext);
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    async function fetchAllAlertsData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getGlobalDashboardData(user.token);
        setAllAlerts(data.activeAlerts);
      } catch (err) {
        console.error('Error fetching all alerts data:', err);
        setError(err.message || 'Failed to fetch all alerts.');
        if (err.message === 'Not authorized, token failed' || err.message === 'Not authorized, no token') {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAllAlertsData();
  }, [user, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSeverityColorClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-unknown';
    }
  };

  const getAlertIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'flood alert': return <Zap className="alert-icon-color-red" size={18} />;
      case 'wildfire warning': return <Activity className="alert-icon-color-orange" size={18} />;
      case 'earthquake': return <Info className="alert-icon-color-blue" size={18} />;
      case 'cyber attack threat': return <MessageSquare className="alert-icon-color-red" size={18} />;
      case 'hurricane advisory': return <Zap className="alert-icon-color-red" size={18} />;
      case 'drought watch': return <Globe className="alert-icon-color-blue" size={18} />;
      default: return <Bell className="alert-icon-color-default" size={18} />;
    }
  };

  return (
    <div className="all-alerts-page-container">
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
      <div className="all-alerts-content">
        <div className="all-alerts-header-section card">
          <Bell className="all-alerts-header-icon" size={60} />
          <h2 className="all-alerts-title">All Active Alerts</h2>
          <p className="all-alerts-subtitle">Comprehensive list of real-time disaster alerts.</p>
          <button onClick={() => navigate('/dashboard')} className="back-to-dashboard-button primary-button">
            <ChevronLeft size={18} className="icon-mr" /> Back to Dashboard
          </button>
        </div>

        {loading && <p className="loading-message">Loading all alerts...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="alerts-list-full-page card">
            {allAlerts.length > 0 ? (
              <ul className="alerts-list">
                {allAlerts.map(alert => (
                  <li key={alert.id} className="alert-item">
                    {getAlertIcon(alert.type)}
                    <div className="alert-details">
                      <p className="alert-type">{alert.type} - {alert.location}</p>
                      <p className="alert-meta">
                        Severity: <span className={`alert-severity ${getSeverityColorClass(alert.severity)}`}>{alert.severity}</span>
                        {alert.message && <span className="alert-message-summary"> | {alert.message}</span>}
                        <span className="alert-time"> | {alert.time}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-alerts-message">No alerts found at this time.</p>
            )}
          </div>
        )}
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

export default AllAlerts;