import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authService from '../utils/services/authService';
import './LoginPage.css';

/**
 * LoginPage Component
 * Handles user authentication with username and password
 */
function LoginPage() {
  const navigate = useNavigate();
  const { role = 'user' } = useParams();
  const normalizedRole = role.toLowerCase() === 'admin' ? 'admin' : 'user';
  const roleLabel = normalizedRole === 'admin' ? 'Admin' : 'User';
  
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    password: '',
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Validate form inputs
   * @returns {boolean} - True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate customer ID
    if (!formData.customerId.trim()) {
      newErrors.customerId = 'Customer ID is required';
    } else if (formData.customerId.trim().length < 3) {
      newErrors.customerId = 'Customer ID must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.customerId)) {
      newErrors.customerId = 'Customer ID can only contain letters, numbers, dashes, and underscores';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the login API
      await authService.login(
        formData.customerId,
        formData.password,
        normalizedRole
      );
      alert("Login Successful");
      navigate("/dashboard");
      
    } catch (error) {
      setGeneralError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle forgot password
   */
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{roleLabel} Login</h1>
          <p>Secure Banking Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* General Error Message */}
          {generalError && (
            <div className="error-message general-error">
              {generalError}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {/* Customer ID Field */}
          <div className="form-group">
            <label htmlFor="customerId">Customer ID</label>
            <input
              type="text"
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              placeholder="Enter your customer ID"
              disabled={isLoading}
              className={errors.customerId ? 'input-error' : ''}
              autoComplete="username"
            />
            {errors.customerId && (
              <span className="error-message">{errors.customerId}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={isLoading}
              className={errors.password ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Additional Links */}
        <div className="login-footer">
          <Link
            className="link-button role-switch"
            to={normalizedRole === 'admin' ? '/login/user' : '/login/admin'}
          >
            {normalizedRole === 'admin'
              ? 'Sign in as User'
              : 'Sign in as Admin'}
          </Link>
          <button
            type="button"
            className="link-button"
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
