import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login'; // Your existing Login component
import Dashboard from './Dashboard'; // Your existing Dashboard component
import PricingPage from './pages/PricingPage'; // New PricingPage component
import ApiDocumentationPage from './pages/ApiDocumentationPage'; // Import the new API Documentation Page
import AboutMichaelPage from './pages/AboutMichaelPage'; // Import the new About Michael Page
import HelpPage from './pages/HelpPage'; // Import the new Help Page
import { AuthContextProvider, AuthContext } from './context/AuthContext'; // AuthContext for global state
import Register from './Register'; // Assuming you will create a Register component

import './App.css'; // Main application styling

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      {/* AuthContextProvider makes user authentication state available throughout the app */}
      <AuthContextProvider>
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* Route for registration */}

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
            <Route // Route for API Documentation Page
              path="/api-documentation"
              element={
                <PrivateRoute>
                  <ApiDocumentationPage />
                </PrivateRoute>
              }
            />
            <Route // Route for About Michael Page
              path="/about-michael"
              element={
                <PrivateRoute>
                  <AboutMichaelPage />
                </PrivateRoute>
              }
            />
            <Route // NEW: Route for Help Page
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
      </AuthContextProvider>
    </Router>
  );
}

export default App;
