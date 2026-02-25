/**
 * API Configuration
 * Contains all API endpoints used in the application
 */

const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',

  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },

  // User endpoints
  USER: {
    GET_PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    CHANGE_PASSWORD: '/api/user/change-password',
  },

  // Account endpoints
  ACCOUNTS: {
    GET_ALL: '/api/accounts',
    GET_BY_ID: '/api/accounts/:id',
    CREATE: '/api/accounts',
  },

  // Transaction endpoints
  TRANSACTIONS: {
    GET_ALL: '/api/transactions',
    GET_BY_ACCOUNT: '/api/transactions/:accountId',
  },

  // Transfer endpoints
  TRANSFERS: {
    CREATE: '/api/transfers',
    GET_HISTORY: '/api/transfers/history',
  },
};

export default API_CONFIG;
