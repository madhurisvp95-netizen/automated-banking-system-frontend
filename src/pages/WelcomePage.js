import React from 'react';
import { Link } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1>Automated Banking System</h1>
        <p>Select your portal to continue</p>

        <div className="role-buttons">
          <Link to="/login/admin" className="role-button admin-role">
            Admin Login
          </Link>
          <Link to="/login/user" className="role-button user-role">
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
