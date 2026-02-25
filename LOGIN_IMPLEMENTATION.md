# Login Implementation Guide

## Overview
This document provides details about the login implementation with username/password validation and REST API integration.

## Architecture

### Components

1. **LoginPage Component** (`src/pages/LoginPage.js`)
   - Displays login form with username and password fields
   - Client-side form validation
   - Error and success message handling
   - Loading state management
   - Forgot password link

2. **DashboardPage Component** (`src/pages/DashboardPage.js`)
   - Protected page shown after successful login
   - Displays welcome message with user info
   - Logout functionality
   - Feature cards for different banking operations

### Services

1. **authService** (`src/services/authService.js`)
   - Handles all authentication-related API calls
   - Manages authentication tokens in localStorage
   - Provides helper methods like `isAuthenticated()`, `getCurrentUser()`, `logout()`
   - Includes automatic token injection in API requests

### Configuration

1. **apiConfig** (`src/config/apiConfig.js`)
   - Centralized API endpoint configuration
   - Easy to maintain and update endpoints
   - Environment-based base URL

## Form Validation

The login form includes the following validation rules:

### Username
- Required field
- Minimum 3 characters
- Only allows: letters, numbers, dashes (-), underscores (_)

### Password
- Required field
- Minimum 6 characters

## API Integration

### Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Expected Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Expected Response (Error):**
```json
{
  "message": "Invalid username or password"
}
```

## Data Flow

1. User enters username and password
2. Form is validated on the client side
3. On submit, username and password are sent to `/api/auth/login` endpoint
4. API response contains a JWT token
5. Token is stored in localStorage and added to subsequent API requests
6. User is redirected to dashboard
7. Dashboard page displays user information

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install required packages:
- `react-router-dom` - For routing between pages
- `axios` - For making HTTP requests

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
```

Adjust `REACT_APP_API_URL` to point to your backend server.

### 3. Update API Service

If your backend uses different endpoint paths, update the `authService.js`:

```javascript
login: async (username, password) => {
  try {
    const response = await apiClient.post('/your/custom/login/path', {
      username,
      password,
    });
    // ... rest of the code
  }
}
```

## Backend Requirements

Your REST API backend should:

1. **Accept POST requests** at `/api/auth/login` endpoint
2. **Validate credentials** against the database
3. **Return a JWT token** on successful authentication
4. **Return a 401 status** with error message on failure
5. **Support Bearer token** authorization header for protected routes

Example Express.js backend endpoint:

```javascript
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate credentials from database
    const user = await User.findOne({ username });
    
    if (!user || !user.validatePassword(password)) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

## Features Implemented

✅ Login form with username and password inputs
✅ Client-side form validation
✅ Real-time validation feedback
✅ Loading state during API call
✅ Error message display
✅ Success message with redirect
✅ JWT token storage
✅ Protected routes
✅ Auto token injection in API calls
✅ Logout functionality
✅ Responsive design
✅ Accessibility features

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage. For enhanced security, consider using:
   - HTTP-only cookies (more secure but requires backend support)
   - sessionStorage (clears on browser close)
   - In-memory storage (lost on page refresh)

2. **HTTPS**: Always use HTTPS in production

3. **Token Expiration**: Implement token refresh mechanism

4. **CORS**: Configure CORS on backend for frontend domain

5. **Password Transmission**: Ensure HTTPS to protect password in transit

## Troubleshooting

### Login fails with CORS error
- Ensure backend has CORS enabled
- Check `REACT_APP_API_URL` in `.env` file
- Verify backend is running

### Token not persisting
- Check browser's localStorage settings
- Ensure backend returns token in response
- Verify response structure matches expected format

### Protected routes not working
- Ensure `authService.isAuthenticated()` returns correct value
- Check token in localStorage: `console.log(localStorage.getItem('authToken'))`
- Verify token isn't expired

## File Structure

```
src/
├── pages/
│   ├── LoginPage.js
│   ├── LoginPage.css
│   ├── DashboardPage.js
│   └── DashboardPage.css
├── services/
│   └── authService.js
├── config/
│   └── apiConfig.js
├── App.js
├── App.css
└── index.js
```

## Next Steps

1. Connect backend API endpoint
2. Test login functionality
3. Implement forgot password feature
4. Add more protected pages
5. Implement token refresh mechanism
6. Add error boundary for better error handling
7. Implement role-based access control (RBAC)
