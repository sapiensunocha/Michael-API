// frontend/src/pages/AboutMichaelPage.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, DollarSign, Settings, HelpCircle, LogOut, Eye, Info } from 'lucide-react';
import '../Dashboard.css'; // Import Dashboard styles for consistent look

function AboutMichaelPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

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

      {/* Main Content Area for About Michael */}
      <main className="dashboard-content about-michael-content">
        <section className="card about-michael-card">
          {/* Updated Title with Animation Class */}
          <h2 className="card-title letter-page-title">A Letter From the Founder</h2>

          <div className="video-container">
            <h3 className="video-title">Meet Michael:</h3>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/oxV6-k-Deuk"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>

          <p className="letter-paragraph">
            When I was born, Rwanda was on fire — a genocide that would scar a nation and shake the conscience of the world. I don’t remember the gunshots or the cries. But my life began in the shadows of catastrophe. My family fled with me — a newborn — to Bukavu in the Democratic Republic of Congo. That place, that moment in time, carved a quiet but powerful truth deep into my spirit: <strong>disasters are not just events… they’re turning points.</strong>
          </p>
          <p className="letter-paragraph">
            I grew up seeing the unseeable. Floods swallowing homes. Wars leaving cities in ashes. Earthquakes rattling lives and hope. Methane gas creeping beneath the lake. Storms, cyberattacks, volcanic eruptions, displacement after displacement. I wasn’t just surviving it. I was absorbing it. And with every passing tragedy, a seed grew in me — a belief that something had to change.
          </p>
          <p className="letter-paragraph">
            Years later, I worked for MONUSCO, the UN’s peacekeeping mission in Congo. Then OVG, the Goma Volcano Observatory. Then the World Bank, the United Nations, international NGOs — chasing disaster zones not because I had to, but because I needed to understand. Across Africa, the Caribbean, Latin America, the Middle East, even parts of Europe and North America, I saw the same truth play out over and over again: <strong>we’re not ready.</strong>
          </p>
          <p className="letter-paragraph">
            We’re not ready because we keep treating disasters as news stories instead of warning signs.
          </p>
          <p className="letter-paragraph">
            And that’s where <strong>Michael</strong> was born.
          </p>
          <p className="letter-paragraph">
            Michael is not just an app. It’s not just an API. It’s not just a piece of tech.
          </p>
          <p className="letter-paragraph">
            <strong>Michael is an angel. A guide. A watchful protector.</strong>
          </p>
          <p className="letter-paragraph">
            Michael is the digital guardian you never knew you needed — awake day and night, scanning the earth and sky for every threat that could shake your world. Not just one type of disaster, but <strong>all</strong> of them: natural, man-made, technological, cosmic. From floods and famines to cyberattacks and solar flares, Michael listens, watches, and alerts. And he doesn’t just shout warnings into the void. He speaks with clarity, simplicity, and purpose — to <strong>you</strong>, no matter where you are.
          </p>
          <p className="letter-paragraph">
            And here’s the heart of it: Michael is for everyone. Whether you're an emergency responder, a government official, a developer integrating the Michael API, or a father living near a floodplain — this is your tool. Your partner. Your ally in building a world that’s proactive, not reactive.
          </p>
          <p className="letter-paragraph">
            Your subscription does more than unlock features. It fuels a mission. It helps us reach that farmer who’s never had access to early warnings. That child in a refugee camp. That mother who just wants to know if the river is rising. <strong>You</strong> become part of that global net of protection — of prevention — of peace.
          </p>
          <p className="letter-paragraph">
            I built Michael because I believed the world could no longer wait. I believe that disasters can be ended — not just managed. And I believe that <strong>you</strong> have a role to play in that transformation.
          </p>
          <p className="letter-paragraph">
            So whether you're using Michael to protect your community, to build resilience in your organization, or to innovate in ways I can’t yet imagine — thank you. You are part of something historic. And I am honored to have you walk this journey with us.
          </p>
          <p className="letter-paragraph">
            Welcome to Michael.
          </p>
          <p className="letter-signature">
            With hope and resolve,<br />
            <span className="founder-initial">S.N.K.</span><br /> {/* Styled initial */}
            Sapiens Ndatabaye Kanyunyi<br /> {/* Full name */}
            Founder, World Disaster Center
          </p>
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

export default AboutMichaelPage;
