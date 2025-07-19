// frontend/src/Dashboard.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AuthContext } from './context/AuthContext';
// Removed generateWorldSummary import
import { getPartnerProfile, getGlobalDashboardData, getTrendingInsights } from './api/backendApi';
import './Dashboard.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Bell, Globe, User, DollarSign, Zap, Activity, Info, MapPin, TrendingUp,
  ChevronRight, MessageSquare, Settings, HelpCircle, LogOut, Briefcase, BarChart, Eye, Layout
} from 'lucide-react';

// Import Recharts components
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Fix Leaflet default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const redIcon = L.divIcon({
  className: 'custom-icon-red',
  html: `<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
const blueIcon = L.divIcon({
  className: 'custom-icon-blue',
  html: `<div style="background-color: blue; width: 15px; height: 15px; border-radius: 50%;"></div>`,
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5],
});

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [partnerName, setPartnerName] = useState('Partner');
  const [globalSummary, setGlobalSummary] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [trendingInsights, setTrendingInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  // Removed AI summary states
  // const [aiSummary, setAiSummary] = useState('');
  // const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  // const [aiSummaryError, setAiSummaryError] = useState(null);

  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  // Slogan animation state (ensure this matches your CSS animation logic)
  const [sloganAnimationClass, setSloganAnimationClass] = useState('');

  useEffect(() => {
    // Trigger typing animation for slogan on component mount
    const timer = setTimeout(() => {
      setSloganAnimationClass('slogan-typing');
    }, 500);

    if (!user || !user.token) {
      console.log('No user or token, navigating to login.');
      navigate('/login');
      return;
    }

    console.log('Dashboard useEffect: Current user email:', user.email, 'ID:', user.id);

    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      // Removed AI summary loading states initialization
      // setAiSummaryLoading(true);
      // setAiSummaryError(null);

      try {
        const profileData = await getPartnerProfile();
        if (profileData && profileData.full_name) {
          setPartnerName(profileData.full_name);
        } else {
          setPartnerName(user.email || 'Partner');
          console.warn('Dashboard.jsx: User profile full_name not found in profileData, using email or default.');
        }

        const globalAndAlertsData = await getGlobalDashboardData();
        setGlobalSummary(globalAndAlertsData.globalSummary);
        setActiveAlerts(globalAndAlertsData.activeAlerts);

        const insightsData = await getTrendingInsights();
        setTrendingInsights(insightsData);

        // --- Removed Fetch AI Generated Summary Block ---
        // if (user.token) {
        //   try {
        //     const aiData = {
        //       globalSummary: globalAndAlertsData.globalSummary,
        //       activeAlerts: globalAndAlertsData.activeAlerts.slice(0, 10),
        //     };
        //     const generatedMessage = await generateWorldSummary(aiData, user.token);
        //     setAiSummary(generatedMessage);
        //   } catch (aiErr) {
        //     console.error('Error generating AI summary:', aiErr);
        //     setAiSummaryError('Failed to generate world summary.');
        //     setAiSummary('Unable to generate an AI summary at this time.');
        //   } finally {
        //     setAiSummaryLoading(false);
        //   }
        // } else {
        //   setAiSummaryLoading(false);
        //   setAiSummary('Login required for AI insights.');
        // }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data.');
        if (
          err.message === 'User not authenticated.' ||
          err.message.includes('Not authorized')
        ) {
          logout();
        }
      } finally {
        setLoading(false);
        // Removed AI summary loading state finalization
        // if (aiSummaryLoading) setAiSummaryLoading(false);
      }
    }

    fetchDashboardData();

    return () => clearTimeout(timer); // Cleanup timer
  }, [user, navigate, logout]); // Removed aiSummaryLoading from dependency array

  // Effect to close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutsideProfile(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideProfile);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideProfile);
    };
  }, [profileDropdownRef]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(prev => !prev);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileDropdownOpen(false); // Close dropdown after navigation
  };

  const getSeverityColorClass = (severity) => {
    const severityValue = typeof severity === 'number' ? severity : parseInt(severity, 10);

    if (severityValue >= 4) {
      return 'severity-high';
    } else if (severityValue >= 2) {
      return 'severity-medium';
    } else if (severityValue >= 1) {
      return 'severity-low';
    }
    return 'severity-unknown';
  };

  const getGlobalSeverityColorClass = (globalSeverityText) => {
    switch ((globalSeverityText || '').toLowerCase()) {
      case 'high global severity':
        return 'severity-high';
      case 'moderate global severity':
        return 'severity-medium';
      case 'low global severity':
        return 'severity-low';
      case 'no active alerts':
        return 'severity-default';
      default:
        return 'severity-default';
    }
  };

  const getSimplifiedSeverityText = (globalSeverityText) => {
    if (!globalSeverityText) {
      return 'N/A';
    }
    const lowerCaseText = globalSeverityText.toLowerCase();
    if (lowerCaseText.includes('high')) {
      return 'High';
    } else if (lowerCaseText.includes('moderate')) {
      return 'Moderate';
    } else if (lowerCaseText.includes('low')) {
      return 'Low';
    } else if (lowerCaseText.includes('no active alerts')) {
      return 'N/A';
    }
    return 'N/A';
  };

  const getAlertIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'flood alert':
        return <Zap className="alert-icon-color-red" size={18} />;
      case 'wildfire warning':
        return <Activity className="alert-icon-color-orange" size={18} />;
      case 'earthquake':
        return <Info className="alert-icon-color-blue" size={18} />;
      case 'cyber attack threat':
        return <MessageSquare className="alert-icon-color-red" size={18} />;
      case 'hurricane advisory':
        return <Zap className="alert-icon-color-red" size={18} />;
      case 'drought watch':
        return <Globe className="alert-icon-color-blue" size={18} />;
      default:
        return <Bell className="alert-icon-color-default" size={18} />;
    }
  };

  const top10Disasters = activeAlerts
    .filter((alert) => alert.latitude != null && alert.longitude != null)
    .sort((a, b) => (b.severity_level || 0) - (a.severity_level || 0))
    .slice(0, 10);

  const otherDisasters = activeAlerts
    .filter((alert) => alert.latitude != null && alert.longitude != null)
    .sort((a, b) => (b.severity_level || 0) - (a.severity_level || 0))
    .slice(10, 40);

  const getUniqueEventTypes = (data) => {
    const eventTypes = new Set();
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        if (key !== 'date') {
          eventTypes.add(key);
        }
      });
    }
    return Array.from(eventTypes);
  };

  const uniqueEventTypes = trendingInsights.length > 0 ? getUniqueEventTypes(trendingInsights) : [];

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#00C49F', '#FFBB28', '#A28DFF', '#FF6B6B',
    '#39A7D8', '#6A057F', '#FB3640', '#00A388', '#FF6F61', '#9ED2BE', '#5E4B5E', '#C0C0C0'
  ];
  const getColorForEventType = (index) => colors[index % colors.length];

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo-and-title-container">
            <img src="/logo.png" alt="WDC Logo" className="logo" />
            <h1 className="app-title">API </h1>
          </div>
          <div className={`animated-slogan slogan-under-logo ${sloganAnimationClass}`}>
            <span className="slogan-text">
              The first Global API that monitors the world in real time
            </span>
          </div>
        </div>

        {/* Removed: Central Search Bar */}
        <div className="nav-middle-empty"></div> {/* Placeholder for layout consistency if needed, adjust CSS accordingly */}


        <div className="nav-right">
          {/* Profile Dropdown Trigger Button */}
          <div className="profile-dropdown-container" ref={profileDropdownRef}>
            <button onClick={toggleProfileDropdown} className="nav-button profile-button">
              <User className="icon-mr" size={18} /> Profile
            </button>
            {isProfileDropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-profile-header">
                  {/* Profile picture/initial div completely removed */}
                  <div className="dropdown-profile-info">
                    {/* Display partnerName, which should be the fetched name or email fallback */}
                    <p className="dropdown-profile-name">{partnerName}</p>
                    <p className="dropdown-profile-email">{user?.email}</p>
                  </div>
                </div>

                <div className="dropdown-section">
                  <p className="dropdown-section-title">Account</p>
                  {/* Changed "View Pricing" to "Upgrade Plan" */}
                  <button onClick={() => handleNavigation('/pricing')} className="dropdown-menu-item">
                    <DollarSign className="icon-mr" size={18} /> Upgrade Plan
                  </button>
                  {/* Changed "View Profile" to "View API" and updated path */}
                  <button onClick={() => handleNavigation('/api-documentation')} className="dropdown-menu-item">
                    <Eye className="icon-mr" size={18} /> View API
                  </button>
                   {/* Added "About Michael" */}
                  <button onClick={() => handleNavigation('/about-michael')} className="dropdown-menu-item">
                    <Info className="icon-mr" size={18} /> About Michael
                  </button>
                  <button onClick={() => handleNavigation('/help')} className="dropdown-menu-item">
                    <HelpCircle className="icon-mr" size={18} /> Help
                  </button>
                </div>
                {/* Removed the entire "Manage" section */}
                <button onClick={handleLogout} className="dropdown-menu-item logout-dropdown-item">
                  <LogOut className="icon-mr" size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <section className="welcome-section card">
          <h2 className="welcome-title">
            Welcome back, <span className="welcome-name">{partnerName}</span>!
          </h2>
          <p className="welcome-message">
            Your real-time insights for a safer, more resilient world.
          </p>
          {/* Removed AI Generated Summary JSX */}
          {/*
          <div className="ai-summary-container">
            {aiSummaryLoading ? (
              <p className="ai-summary-loading">Generating world summary...</p>
            ) : aiSummaryError ? (
              <p className="ai-summary-error">{aiSummaryError}</p>
            ) : aiSummary && (
              <p className="ai-generated-summary">
                {aiSummary.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < aiSummary.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
          */}
        </section>

        {loading && <p className="loading-message">Loading dashboard data...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <section className="global-overview-grid">
              <div className="overview-card critical-alerts-card-summary">
                <div className="overview-text">
                  <p className="overview-label">Critical Alerts</p>
                  <p className="overview-value">{globalSummary?.criticalAlerts || 0}</p>
                </div>
                <Bell className="overview-icon critical-icon" />
              </div>

              <div className="overview-card">
                <div className="overview-text">
                  <p className="overview-label">Locations Affected Worldwide</p>
                  <p className="overview-value">{globalSummary?.locationsAffectedWorldwide || 0}</p>
                </div>
                <Globe className="overview-icon" />
              </div>

              <div className="overview-card">
                <div className="overview-text">
                  <p className="overview-label">Global Severity Level</p>
                  <p className={`overview-value ${getGlobalSeverityColorClass(globalSummary?.globalSeverityLevel)}`}>
                    {getSimplifiedSeverityText(globalSummary?.globalSeverityLevel)}
                  </p>
                </div>
                <Zap className="overview-icon" />
              </div>

              <div className="overview-card">
                <div className="overview-text">
                  <p className="overview-label">Total Sources</p>
                  <p className="overview-value">{globalSummary?.totalSources?.toLocaleString() || 'N/A'}</p>
                </div>
                <Info className="overview-icon" />
              </div>
            </section>

            <section className="main-content-grid">
              <div className="active-alerts-section card">
                <h3 className="card-title">
                  <Bell className="icon-mr" size={24} /> Recent Active Alerts
                </h3>
                {activeAlerts.length > 0 ? (
                  <ul className="alerts-list">
                    {activeAlerts.map((alert) => (
                      <li key={alert.id} className="alert-item">
                        {getAlertIcon(alert.event_type)}
                        <div className="alert-details">
                          <p className="alert-type">
                            {alert.event_type} - {alert.location_name}
                          </p>
                          <p className="alert-meta">
                            Severity:{' '}
                            <span className={`alert-severity ${getSeverityColorClass(alert.severity_level)}`}>
                              {alert.severity_level || 'Unknown'}
                            </span>
                            {alert.alert_message && (
                              <span className="alert-message-summary">
                                {' '}| {alert.alert_message.substring(0, 50)}
                                {alert.alert_message.length > 50 ? '...' : ''}
                              </span>
                            )}
                            <span className="alert-time"> | {new Date(alert.start_time).toLocaleString()}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-alerts-message">No active alerts at this time.</p>
                )}
                <button onClick={() => handleNavigation('/all-alerts')} className="card-button primary-button">
                  View All Alerts <ChevronRight size={18} />
                </button>
              </div>

              <div className="map-section card">
                <h3 className="card-title">
                  <Globe className="icon-mr" size={24} /> Global Disaster Hotspots
                </h3>
                {activeAlerts.length > 0 ? (
                  <MapContainer
                    center={[0, 0]}
                    zoom={2}
                    style={{ height: '450px', width: '100%' }}
                    className="map-container"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                      attribution='© <a href="https://carto.com/attributions">CartoDB</a>'
                    />
                    {top10Disasters.map((alert) => (
                      <Marker
                        key={alert.id}
                        position={[alert.latitude, alert.longitude]}
                        icon={redIcon}
                      >
                        <Popup>
                          {`${alert.event_type} - ${alert.location_name}`}
                          <br />
                          Severity: {alert.severity_level || 'Unknown'}
                        </Popup>
                      </Marker>
                    ))}
                    {otherDisasters.map((alert) => (
                      <Marker
                        key={alert.id}
                        position={[alert.latitude, alert.longitude]}
                        icon={blueIcon}
                      >
                        <Popup>
                          {`${alert.event_type} - ${alert.location_name}`}
                          <br />
                          Severity: {alert.severity_level || 'Unknown'}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <p className="no-data-message">No disaster data available for the map.</p>
                )}
                <button
                  onClick={() => handleNavigation('/interactive-map')}
                  className="card-button primary-button"
                >
                  Explore Interactive Map <ChevronRight size={18} />
                </button>
              </div>
            </section>

            <section className="insights-section card">
              <h3 className="card-title">
                <TrendingUp className="icon-mr" size={24} /> Actionable Insights
              </h3>
              <div className="insights-chart-container" style={{ width: '100%', height: '300px' }}>
                {trendingInsights.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendingInsights}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" />
                      <YAxis
                        scale="log"
                        domain={[1, 'dataMax']}
                        allowDataOverflow={true}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip />
                      <Legend />
                      {uniqueEventTypes.map((eventType, index) => (
                        <Line
                          key={eventType}
                          type="monotone"
                          dataKey={eventType}
                          stroke={getColorForEventType(index)}
                          activeDot={{ r: 8 }}
                          connectNulls={true}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-insights-message">No trending insights available for the last 7 days.</p>
                )}
              </div>
              <button onClick={() => handleNavigation('/all-insights')} className="card-button primary-button mt-6">
                Explore All Insights <ChevronRight size={18} />
              </button>
            </section>
          </>
        )}
      </div>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} World Disaster Center. All rights reserved.</p>
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

export default Dashboard;