/**
 * Validation Utilities
 * Reusable validation functions for form fields
 */

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return {
      isValid: false,
      error: 'Username is required',
    };
  }

  if (username.trim().length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters',
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, dashes, and underscores',
    };
  }

  return {
    isValid: true,
    error: '',
  };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required',
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters',
    };
  }

  return {
    isValid: true,
    error: '',
  };
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return {
    isValid: true,
    error: '',
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, strength: string, error: string }
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return {
      isValid: false,
      strength: 'weak',
      error: 'Password is required',
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      strength: 'weak',
      error: 'Password must be at least 6 characters',
    };
  }

  let strength = 'weak';
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(
    Boolean
  ).length;

  if (password.length >= 12 && strengthCount >= 3) {
    strength = 'strong';
  } else if (password.length >= 8 && strengthCount >= 2) {
    strength = 'medium';
  }

  return {
    isValid: true,
    strength,
    error: '',
  };
};
