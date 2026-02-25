import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './DashboardPage.css';

/**
 * DashboardPage Component
 * Displays after successful login
 */
function DashboardPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Banking System Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {currentUser?.username || 'User'}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Your Banking Portal</h2>
          <p>You have successfully logged in to the Automated Banking System.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Accounts</h3>
            <p>Manage your bank accounts</p>
          </div>
          <div className="feature-card">
            <h3>Transfers</h3>
            <p>Send money to other accounts</p>
          </div>
          <div className="feature-card">
            <h3>Bills</h3>
            <p>Pay your bills online</p>
          </div>
          <div className="feature-card">
            <h3>History</h3>
            <p>View transaction history</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
