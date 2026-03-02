import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../utils/services/authService';
import './LoginPage.css';

function CreateUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    address: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.username.trim()) {
      nextErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      nextErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      nextErrors.username = 'Username can only contain letters, numbers, dashes, and underscores';
    }

    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber.trim())) {
      nextErrors.phoneNumber = 'Phone number must be 10 to 15 digits';
    }

    if (!formData.address.trim()) {
      nextErrors.address = 'Address is required';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
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
      await authService.createUser({
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });
      setSuccessMessage('User created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login/user'), 1200);
    } catch (error) {
      setGeneralError(error.message || 'User creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Create New User</h1>
          <p>Create your banking portal credentials</p>
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              disabled={isLoading}
              className={errors.username ? 'input-error' : ''}
              autoComplete="username"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              disabled={isLoading}
              className={errors.phoneNumber ? 'input-error' : ''}
              autoComplete="tel"
            />
            {errors.phoneNumber && (
              <span className="error-message">{errors.phoneNumber}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              disabled={isLoading}
              className={errors.address ? 'input-error' : ''}
              autoComplete="street-address"
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              disabled={isLoading}
              className={errors.password ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create User'}
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

export default CreateUserPage;
