import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8085';
const ADMIN_LOGIN_ENDPOINT = process.env.REACT_APP_ADMIN_LOGIN_ENDPOINT;
const USER_LOGIN_ENDPOINT = process.env.REACT_APP_USER_LOGIN_ENDPOINT;
const DEFAULT_LOGIN_ENDPOINT = process.env.REACT_APP_LOGIN_ENDPOINT || '/api/auth/login';
const USER_PROFILE_ENDPOINT = process.env.REACT_APP_USER_PROFILE_ENDPOINT || '/api/banking/me';
const USER_BALANCE_ENDPOINT = process.env.REACT_APP_USER_BALANCE_ENDPOINT || '/api/banking/me';

/**
 * Create an axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
/**
 * Add token to headers if it exists in localStorage
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const buildLoginEndpoints = (role) => {
  if (role === 'admin') {
    return [
      ADMIN_LOGIN_ENDPOINT,
      '/api/login/loginUser',
      DEFAULT_LOGIN_ENDPOINT,
    ].filter(Boolean);
  }

  return [
    USER_LOGIN_ENDPOINT,
    '/api/login/loginUser',
    DEFAULT_LOGIN_ENDPOINT,
  ].filter(Boolean);
};

const getLoginPayloadVariants = (customerId, password) => [
  { customerId, password },
];

const isAuthStatus = (status) => status === 401 || status === 403;
const pickFirst = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

const normalizeUserFields = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  const normalized = {
    username: pickFirst(obj, ['username', 'customerName', 'name']),
    accountNumber: pickFirst(obj, ['accountNumber', 'accountNo', 'accountId', 'customerId']),
    address: pickFirst(obj, ['address']),
    phoneNumber: pickFirst(obj, ['phoneNumber', 'phone', 'mobileNumber', 'mobile']),
    accountBalance: pickFirst(obj, ['accountBalance', 'balance', 'currentBalance', 'availableBalance']),
    role: pickFirst(obj, ['role']),
  };

  if (
    !normalized.username &&
    !normalized.accountNumber &&
    !normalized.address &&
    !normalized.phoneNumber &&
    !normalized.accountBalance &&
    !normalized.role
  ) {
    return null;
  }

  return normalized;
};

const extractBalanceFromResponse = (data) => {
  const objects = collectNestedObjects(data);
  for (const obj of objects) {
    const balance = pickFirst(obj, ['balance', 'accountBalance', 'currentBalance', 'availableBalance']);
    if (balance !== '') {
      return balance;
    }
  }
  return '';
};

const resolveEndpoint = (endpoint, customerId = '') => {
  if (!endpoint) {
    return '';
  }
  if (endpoint.includes(':customerId')) {
    return endpoint.replace(':customerId', encodeURIComponent(customerId));
  }
  return endpoint;
};

const collectNestedObjects = (input) => {
  const queue = [input];
  const seen = new Set();
  const objects = [];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);
    objects.push(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        queue.push(item);
      }
    } else {
      for (const value of Object.values(current)) {
        queue.push(value);
      }
    }
  }

  return objects;
};

const extractUserFromLoginResponse = (data) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const candidates = [
    data.user,
    data.customer,
    data.profile,
    data.data,
    data.result,
    data,
    ...collectNestedObjects(data),
  ];

  const merged = {
    username: '',
    accountNumber: '',
    address: '',
    phoneNumber: '',
    accountBalance: '',
    role: '',
  };

  for (const candidate of candidates) {
    const normalized = normalizeUserFields(candidate);
    if (normalized) {
      merged.username = merged.username || normalized.username;
      merged.accountNumber = merged.accountNumber || normalized.accountNumber;
      merged.address = merged.address || normalized.address;
      merged.phoneNumber = merged.phoneNumber || normalized.phoneNumber;
      merged.accountBalance = merged.accountBalance || normalized.accountBalance;
      merged.role = merged.role || normalized.role;
    }
  }

  if (
    !merged.username &&
    !merged.accountNumber &&
    !merged.address &&
    !merged.phoneNumber &&
    !merged.accountBalance &&
    !merged.role
  ) {
    return null;
  }

  return merged;
};

/**
 * Auth Service - handles login and authentication related API calls
 */
const authService = {
  /**
   * Login user/admin with username and password
   * @param {string} customerId - User's customer ID
   * @param {string} password - User's password
   * @param {string} role - Login role: user or admin
   * @returns {Promise} - Promise containing the API response
   */
  login: async (customerId, password, role = 'user') => {
    const normalizedRole = role === 'admin' ? 'admin' : 'user';
    const endpoints = buildLoginEndpoints(normalizedRole);
    const payloadVariants = getLoginPayloadVariants(customerId, password);
    let lastError = null;

    console.log('[Auth][Login] Start', {
      role: normalizedRole,
      baseURL: API_URL,
      endpoints,
    });

    for (const endpoint of endpoints) {
      for (const payload of payloadVariants) {
        const payloadShape = Object.keys(payload).join(',');
        const resolvedUrl = endpoint.startsWith('http')
          ? endpoint
          : `${API_URL}${endpoint}`;

        console.log('[Auth][Login] Attempt', {
          role: normalizedRole,
          endpoint,
          resolvedUrl,
          payloadShape,
        });

        try {
          const response = await apiClient.post(endpoint, payload);

          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
          }

          const user = extractUserFromLoginResponse(response.data);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          localStorage.setItem('loginCustomerId', customerId);
          console.log('[Auth][Login] Stored user', user);

          localStorage.setItem('selectedRole', normalizedRole);
          console.log('[Auth][Login] Success', {
            role: normalizedRole,
            endpoint,
            resolvedUrl,
            status: response.status,
          });
          return response.data;
        } catch (error) {
          lastError = error;
          const status = error.response?.status;
          const message = error.response?.data?.message || error.message;

          console.log('[Auth][Login] Failed attempt', {
            role: normalizedRole,
            endpoint,
            resolvedUrl,
            payloadShape,
            status,
            message,
          });

          // Correct endpoint but invalid credentials/permissions: stop retrying.
          if (isAuthStatus(status)) {
            throw new Error(error.response?.data?.message || 'Invalid credentials');
          }
        }
      }
    }

    console.log('[Auth][Login] Exhausted all attempts', {
      role: normalizedRole,
      endpointsTried: endpoints,
    });
    throw new Error(lastError?.response?.data?.message || 'Login failed');
  },

  /**
   * Logout user - clear stored credentials
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginCustomerId');
  },

  /**
   * Get stored user info
   * @returns {Object|null} - User object or null if not logged in
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getLoginCustomerId: () => {
    return localStorage.getItem('loginCustomerId') || '';
  },

  fetchUserDashboardDetails: async () => {
    const existingUser = authService.getCurrentUser() || {};
    const customerId = authService.getLoginCustomerId() || existingUser.customerId || existingUser.accountNumber || '';
    const profileCandidates = [
      USER_PROFILE_ENDPOINT,
      '/api/banking/me',
      '/api/user/:customerId',
      '/api/users/:customerId',
      '/api/user/details',
    ];
    const balanceCandidates = [
      USER_BALANCE_ENDPOINT,
      '/api/banking/me',
      '/api/accounts/:customerId/balance',
      '/api/account/:customerId/balance',
      '/api/user/balance',
    ];

    let mergedUser = { ...existingUser };

    for (const endpointTemplate of profileCandidates) {
      const endpoint = resolveEndpoint(endpointTemplate, customerId);
      try {
        const response = await apiClient.get(endpoint, {
          params: customerId ? { customerId } : undefined,
        });
        const extracted = extractUserFromLoginResponse(response.data);
        if (extracted) {
          mergedUser = { ...mergedUser, ...extracted };
          break;
        }
      } catch (error) {
        // Continue trying fallback endpoints
      }
    }

    for (const endpointTemplate of balanceCandidates) {
      const endpoint = resolveEndpoint(endpointTemplate, customerId);
      try {
        const response = await apiClient.get(endpoint, {
          params: {
            ...(customerId ? { customerId } : {}),
            ...(mergedUser.accountNumber ? { accountNumber: mergedUser.accountNumber } : {}),
          },
        });
        const balance = extractBalanceFromResponse(response.data);
        if (balance !== '') {
          mergedUser.balance = balance;
          break;
        }
      } catch (error) {
        // Continue trying fallback endpoints
      }
    }

    if (Object.keys(mergedUser).length) {
      localStorage.setItem('user', JSON.stringify(mergedUser));
    }

    return mergedUser;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if token exists
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default authService;
