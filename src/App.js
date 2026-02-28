import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WelcomePage from './pages/WelcomePage';
import authService from './utils/services/authService';
import './App.css';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome Route */}
        <Route
          path="/"
          element={<WelcomePage />}
        />

        {/* Role-based Login Routes */}
        <Route path="/login" element={<Navigate to="/login/user" replace />} />
        <Route path="/login/:role" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/deposit" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:tab"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
