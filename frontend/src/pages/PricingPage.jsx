// frontend/src/pages/PricingPage.jsx (UPDATED - Direct Header/Footer Copy)
import React, { useEffect, useContext, useState, useRef } from 'react'; // Added useState, useRef
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, DollarSign, Settings, HelpCircle, LogOut, Eye, Info } from 'lucide-react'; // Added Lucide icons
import '../Dashboard.css'; // Make sure Dashboard.css is available for header/footer styles
import '../PricingPage.css'; // PricingPage specific styles

function PricingPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // State for dropdown
  const profileDropdownRef = useRef(null); // Ref for dropdown click outside

  // Redirects to login if user is not authenticated
  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
    }

    // Effect to close profile dropdown when clicking outside (copied from DashboardHeader logic)
    function handleClickOutsideProfile(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideProfile);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideProfile);
    };
  }, [user, navigate]); // Added profileDropdownRef to dependencies for useEffect, though not strictly necessary

  // Handlers for profile dropdown and navigation (copied from DashboardHeader logic)
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

  return (
    <div className="dashboard-container">
      {/* --- Start Copied Header from ApiDocumentationPage.jsx --- */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo-and-title-container">
            <img src="/logo.png" alt="WDC Logo" className="logo" />
            <h1 className="app-title">API </h1>
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
      {/* --- End Copied Header --- */}

      {/* Main content area for pricing page */}
      <main className="dashboard-content pricing-main-content">
        <div className="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Select the best plan that fits your organization's needs.</p>
          {/* Removed the 'Back to Dashboard' button as navigation is now in the copied header */}
        </div>

        {/* Stripe Embedded Pricing Table */}
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>

        <div className="stripe-table-wrapper">
          <stripe-pricing-table
            pricing-table-id="prctbl_1RmVBYDV4GGUfngREfl8WuQx"
            publishable-key="pk_live_51QlhX1DV4GGUfngRRIJi02QYB2pTZg2bbX9T4xwM0i6FflEPt2FtV7ydZfNks9I9vOAcmwsLGM1U7tzbpmaP454C00qsme0XJ8"
            client-reference-id={user?.id || ''}
          ></stripe-pricing-table>
        </div>
      </main>

      {/* --- Start Copied Footer from ApiDocumentationPage.jsx --- */}
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
      {/* --- End Copied Footer --- */}
    </div>
  );
}

export default PricingPage;