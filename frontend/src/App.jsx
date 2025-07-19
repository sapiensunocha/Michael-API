// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login';
import Dashboard from './Dashboard';
import PricingPage from './pages/PricingPage';
import Profile from './pages/Profile';
// Corrected import: import AuthProvider, not AuthContextProvider
import { AuthProvider, AuthContext } from './context/AuthContext';
import Register from './Register';
import Payment from './Payment';
import './App.css'; // Main application styling

// Component to protect private routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext); // Also check loading state
  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner/skeleton
  }
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider> {/* Corrected usage: AuthProvider */}
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private routes */}
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
              path="/payment"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
            {/* New Private Profile Route */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 fallback */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;