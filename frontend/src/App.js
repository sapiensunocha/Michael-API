  // frontend/src/App.js (Only showing the relevant section)

  import React from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import Login from './Login';
  import Dashboard from './Dashboard';
  import PricingPage from './pages/PricingPage';
  import ApiDocumentationPage from './pages/ApiDocumentationPage';
  import AboutMichaelPage from './pages/AboutMichaelPage';
  import HelpPage from './pages/HelpPage';
  import ForgotPassword from './ForgotPassword';
  import ResetPassword from './ResetPassword'; // NEW: Import the ResetPassword component
  import { AuthProvider, AuthContext } from './context/AuthContext';
  import Register from './Register';

  import './App.css';

  const PrivateRoute = ({ children }) => {
    const { user } = React.useContext(AuthContext);
    return user ? children : <Navigate to="/login" replace />;
  };

  function App() {
    return (
      <Router>
        <AuthProvider>
          <div className="app-container">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} /> {/* NEW: Route for Reset Password */}

              {/* Private routes - accessible only if authenticated */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/pricing"
                element={
                  <PrivateRoute>
                    <PricingPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/api-documentation"
                element={
                  <PrivateRoute>
                    <ApiDocumentationPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/about-michael"
                element={
                  <PrivateRoute>
                    <AboutMichaelPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <PrivateRoute>
                    <HelpPage />
                  </PrivateRoute>
                }
              />

              {/* Redirect root to login or dashboard based on auth status */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Fallback for undefined routes */}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    );
  }

  export default App;