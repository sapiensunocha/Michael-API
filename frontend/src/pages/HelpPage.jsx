// frontend/src/pages/HelpPage.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, DollarSign, Settings, HelpCircle, LogOut, Eye, Info, Mail, Phone, MapPin } from 'lucide-react';
import '../Dashboard.css'; // Import Dashboard styles for consistent look

function HelpPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', formData);
    alert('Your message has been sent! We will get back to you soon.');
    // Clear form
    setFormData({ name: '', email: '', message: '' });
  };

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

  return (
    <div className="dashboard-container">
      {/* Reusing the Dashboard Navigation Bar */}
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

        {/* Placeholder for nav-middle-search (removed search bar) */}
        <div className="nav-middle-empty"></div>

        <div className="nav-right">
          {/* Profile Dropdown Trigger Button */}
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

      {/* Main Content Area for Help Page */}
      <main className="dashboard-content help-content">
        <section className="card help-card">
          <h2 className="card-title"><HelpCircle size={28} className="icon-mr" />Help & Support</h2>

          <div className="help-sections-grid">
            <div className="contact-form-section">
              <h3>Contact Our Support Team</h3>
              <p>Have a question or need assistance? Fill out the form below, and we'll get back to you as soon as possible.</p>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="primary-button submit-button">
                  Send Message <Mail size={18} className="icon-ml" />
                </button>
              </form>
            </div>

            <div className="resources-section">
              <h3>Additional Resources & Contact</h3>
              <p>
                Our experts are here to help you understand and leverage the full potential of the Michael App and the World Disaster Center's mission.
              </p>
              <ul className="resource-list">
                <li>
                  <Mail size={20} className="icon-mr" />
                  For direct inquiries, reach out to our team at:{' '}
                  <a href="mailto:office@worlddisastercenter.org" className="resource-link">
                    office@worlddisastercenter.org
                  </a>
                </li>
                <li>
                  <Info size={20} className="icon-mr" />
                  Learn more about the Michael App and its redefinition of catastrophe and disaster, inspired by the founder's profound experiences. Michael is designed to provide real-time, inclusive, and transparent information about all types of threats globally.
                </li>
                <li>
                  <Eye size={20} className="icon-mr" />
                  Explore our comprehensive API Documentation to integrate real-time disaster intelligence into your systems.
                </li>
                <li>
                  <DollarSign size={20} className="icon-mr" />
                  Review our Pricing Plans to find a subscription that best suits your needs and contributes to our global mission.
                </li>
                <li>
                  <MapPin size={20} className="icon-mr" />
                  The World Disaster Center is committed to ending disasters, not just preventing them, by providing strategic information to everyone, everywhere, every time.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Reusing the Dashboard Footer */}
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

export default HelpPage;
