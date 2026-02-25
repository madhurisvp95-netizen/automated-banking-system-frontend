/**
 * Example Usage of Authentication Service
 * 
 * This file demonstrates how to use the authService in various scenarios
 */

import authService from '../services/authService';

// ============================================
// EXAMPLE 1: Login User
// ============================================
async function exampleLogin() {
  try {
    const response = await authService.login('john_doe', 'password123');
    console.log('Login successful:', response);
    // Token is automatically stored in localStorage
    // User is automatically stored in localStorage
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

// ============================================
// EXAMPLE 2: Check if User is Authenticated
// ============================================
function exampleCheckAuth() {
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    console.log('User is logged in');
  } else {
    console.log('User is not logged in');
  }
}

// ============================================
// EXAMPLE 3: Get Current User Info
// ============================================
function exampleGetUser() {
  const currentUser = authService.getCurrentUser();
  
  if (currentUser) {
    console.log('Current user:', currentUser);
    console.log('Username:', currentUser.username);
    console.log('Email:', currentUser.email);
  } else {
    console.log('No user logged in');
  }
}

// ============================================
// EXAMPLE 4: Logout User
// ============================================
function exampleLogout() {
  authService.logout();
  console.log('User logged out');
  // Token and user info are removed from localStorage
}

// ============================================
// EXAMPLE 5: Using in React Component
// ============================================
import React, { useEffect, useState } from 'react';

function ExampleComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and get user info
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    // Redirect to login page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.username}</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Please Log In</h1>
        </div>
      )}
    </div>
  );
}

export default ExampleComponent;

// ============================================
// EXAMPLE 6: Using authService in Custom Hook
// ============================================
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status on component mount
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
}

// ============================================
// EXAMPLE 7: Using Custom Hook in Component
// ============================================
function ExampleWithHook() {
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('john_doe', 'password123');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome back, {user?.username}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 8: Making Authenticated API Calls
// ============================================
import axios from 'axios';

async function exampleAuthenticatedCall() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get('http://localhost:8080/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('User profile:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      authService.logout();
    }
    console.error('API call failed:', error.message);
  }
}

// ============================================
// EXAMPLE 9: Interceptor Pattern
// ============================================
// The authService already includes an interceptor that:
// 1. Automatically adds the token to every request
// 2. Handles 401 responses (optional)
//
// So you can use apiClient directly:
// 
// import apiClient from '../services/authService';
// 
// apiClient.get('/api/user/profile')
//   .then(response => console.log(response.data))
//   .catch(error => console.error(error));
