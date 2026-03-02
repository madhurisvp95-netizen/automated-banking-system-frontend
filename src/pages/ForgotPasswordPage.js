import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../utils/services/authService';
import './LoginPage.css';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.customerId.trim()) {
      nextErrors.customerId = 'Customer ID is required';
    }

    if (!formData.newPassword) {
      nextErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      nextErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(
        formData.customerId.trim(),
        formData.newPassword
      );
      setSuccessMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login/user'), 1200);
    } catch (error) {
      setGeneralError(error.message || 'Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>Set a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {generalError && (
            <div className="error-message general-error">
              {generalError}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="customerId">Customer ID</label>
            <input
              type="text"
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              placeholder="Enter your customer ID"
              disabled={isLoading}
              className={errors.customerId ? 'input-error' : ''}
            />
            {errors.customerId && (
              <span className="error-message">{errors.customerId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              disabled={isLoading}
              className={errors.newPassword ? 'input-error' : ''}
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              disabled={isLoading}
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="login-footer">
          <Link className="link-button" to="/login/user">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
