// frontend/src/pages/ApiDocumentationPage.jsx
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  User,
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
  Eye,
  Info
} from 'lucide-react';
import '../Dashboard.css';

function ApiDocumentationPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const apiKeyValueRef = useRef(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const getProfileInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'P';
  };

  const handleCopyClick = () => {
    if (apiKeyValueRef.current) {
      const range = document.createRange();
      range.selectNode(apiKeyValueRef.current);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy API key. Please copy it manually.');
      }
      window.getSelection().removeAllRanges();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileDropdownOpen(false);
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo-and-title-container">
            <img src="/logo.png" alt="WDC Logo" className="logo" />
            <h1 className="app-title">API</h1>
          </div>
          <div className="slogan-under-logo">
            <span className="slogan-text">
              The first Global API that monitors the world in real time
            </span>
          </div>
        </div>

        <div className="nav-middle-empty"></div>

        <div className="nav-right">
          <div className="profile-dropdown-container" ref={profileDropdownRef}>
            <button onClick={toggleProfileDropdown} className="nav-button profile-button">
              <User className="icon-mr" size={18} /> Profile
            </button>
            {isProfileDropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-profile-header">
                  <div className="dropdown-profile-info">
                    <p className="dropdown-profile-name">{user?.name || user?.email || 'Guest'}</p>
                    <p className="dropdown-profile-email">{user?.email}</p>
                  </div>
                </div>
                <div className="dropdown-section">
                  <p className="dropdown-section-title">Account</p>
                  <button onClick={() => handleNavigation('/pricing')} className="dropdown-menu-item">
                    <DollarSign className="icon-mr" size={18} /> Upgrade Plan
                  </button>
                  <button onClick={() => handleNavigation('/api-documentation')} className="dropdown-menu-item">
                    <Eye className="icon-mr" size={18} /> View API
                  </button>
                  <button onClick={() => handleNavigation('/about-michael')} className="dropdown-menu-item">
                    <Info className="icon-mr" size={18} /> About Michael
                  </button>
                  <button onClick={() => handleNavigation('/help')} className="dropdown-menu-item">
                    <HelpCircle className="icon-mr" size={18} /> Help
                  </button>
                </div>
                <button onClick={handleLogout} className="dropdown-menu-item logout-dropdown-item">
                  <LogOut className="icon-mr" size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="dashboard-content api-documentation-content">
        <section className="card api-key-section">
          <h2 className="card-title">
            <Eye size={28} className="icon-mr" />Your API Key
          </h2>
          <p className="api-key-description">
            Use this key to authenticate your requests to the World Disaster Center API.
          </p>
          <div className="api-key-display">
            <span ref={apiKeyValueRef} className="api-key-value">
              {user?.api_key || 'API Key not available. Please log in.'}
            </span>
            <button onClick={handleCopyClick} className="copy-api-key-button">
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? ' Copied!' : ' Copy Key'}
            </button>
          </div>
          {/* Changed from user?.plan_name to user?.api_plan */}
          {user?.api_plan && (
            <p className="api-key-plan-info">
              Your current plan: <span className="api-plan-name">{user.api_plan}</span>
            </p>
          )}
        </section>

        <section className="card api-documentation-section">
          <h2 className="card-title">
            <Settings size={28} className="icon-mr" />API Documentation
          </h2>

          <h3>Authentication</h3>
          <p>
            All API requests must be authenticated using your API Key. Include your key in the{' '}
            <code>Authorization</code> header as a Bearer token:
          </p>
          <pre>
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>

          <h3>Base URL</h3>
          <p>The base URL for all API endpoints is:</p>
          <pre>
            <code>{process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3000/api'}</code>
          </pre>

          <h3>Endpoints</h3>

          <h4>1. Get Global Dashboard Summary</h4>
          <p>Retrieves key metrics and a summary of global disaster data.</p>
          <ul>
            <li>
              <strong>Endpoint:</strong> <code>/partners/dashboard/global-summary</code>
            </li>
            <li>
              <strong>Method:</strong> <code>GET</code>
            </li>
            <li>
              <strong>Authentication:</strong> Required
            </li>
            <li>
              <strong>Response:</strong>
              <pre>
                <code>{`{
  "globalSummary": {
    "criticalAlerts": 128,
    "locationsAffectedWorldwide": 56,
    "globalSeverityLevel": "High Global Severity",
    "totalSources": 1200
  },
  "activeAlerts": [
    {
      "id": "alert-123",
      "event_type": "Flood Alert",
      "location_name": "New York, USA",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "severity_level": 5,
      "alert_message": "Severe flooding expected in coastal areas.",
      "start_time": "2025-07-01T10:00:00Z"
    }
  ]
}`}</code>
              </pre>
            </li>
          </ul>

          <h4>2. Get Trending Insights</h4>
          <p>Fetches data on trending disaster types over time.</p>
          <ul>
            <li>
              <strong>Endpoint:</strong> <code>/partners/dashboard/trending-insights</code>
            </li>
            <li>
              <strong>Method:</strong> <code>GET</code>
            </li>
            <li>
              <strong>Authentication:</strong> Required
            </li>
            <li>
              <strong>Response:</strong>
              <pre>
                <code>{`[
  { "date": "2025-06-28", "Wildfire": 10, "Flood": 5, "Earthquake": 2 },
  { "date": "2025-06-29", "Wildfire": 12, "Flood": 7, "Earthquake": 3 },
  { "date": "2025-06-30", "Wildfire": 15, "Flood": 8, "Earthquake": 4 }
]`}</code>
              </pre>
            </li>
          </ul>

          <h3>Error Responses</h3>
          <p>Common error responses you might encounter:</p>
          <ul>
            <li>
              <code>401 Unauthorized</code>: Invalid or missing API Key.
            </li>
            <li>
              <code>403 Forbidden</code>: Your plan does not have access to this endpoint or data.
            </li>
            <li>
              <code>404 Not Found</code>: The requested resource does not exist.
            </li>
            <li>
              <code>500 Internal Server Error</code>: An unexpected error occurred on the server.
            </li>
          </ul>
        </section>
      </main>

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

export default ApiDocumentationPage;