# Development & Integration Guide

## 🎯 Overview

This guide provides step-by-step instructions for development and backend integration of the login system.

---

## 📋 Pre-Integration Checklist

Before integrating with your backend, ensure:

- [ ] Node.js v14+ installed
- [ ] npm installed
- [ ] Backend server available or documented
- [ ] Backend API endpoint `/api/auth/login` designed
- [ ] Database schema ready
- [ ] CORS configured on backend
- [ ] JWT token generation ready

---

## 🔧 Development Setup

### 1. Initial Setup

```bash
# Navigate to project
cd /home/labuser/FinalProject-Frontend/automated-banking-system-frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### 2. Environment Configuration

Create `.env` file (or copy from `.env.example`):

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
```

Adjust `REACT_APP_API_URL` to your backend server.

### 3. Verify Setup

Check that:
- [ ] App opens without errors
- [ ] Redirects to login page
- [ ] Login form renders
- [ ] Validation works (try entering invalid data)
- [ ] Form submits (even if API fails)

---

## 🔌 Backend Integration Steps

### Step 1: Verify API Endpoint

Your backend must have:

**Endpoint**: `POST /api/auth/login`

```javascript
// Node.js / Express example
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Validate credentials against database
  // Generate JWT token
  // Return token + user info
  
  res.json({
    token: 'JWT_TOKEN_HERE',
    user: {
      id: 'user_id',
      username: 'username',
      email: 'email@example.com'
    }
  });
});
```

### Step 2: Test API with Postman

Before testing frontend:

1. Open Postman
2. Create POST request to `http://localhost:8080/api/auth/login`
3. Set Body to:
```json
{
  "username": "testuser",
  "password": "testpass"
}
```
4. Send request
5. Verify response includes `token` and `user`

### Step 3: Update Frontend URL

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:8080
```

Restart dev server: `npm start`

### Step 4: Test Login Flow

1. Enter valid credentials
2. Click Submit
3. Check Network tab:
   - Request goes to `/api/auth/login`
   - Response status is 200
   - Response contains `token`
4. Check localStorage:
   - `authToken` should have JWT value
   - `user` should have user object
5. Should redirect to dashboard
6. Dashboard displays username

### Step 5: Test Error Handling

1. Enter invalid credentials
2. Click Submit
3. Should see error message
4. Should stay on login page
5. localStorage should be empty

### Step 6: Test Logout

1. Click logout button
2. localStorage should clear
3. Should redirect to login
4. Token should be gone

---

## 🛠️ Common Backend Implementations

### Example 1: Node.js / Express

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in database
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      password, 
      user.password
    );
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### Example 2: Python / Flask

```python
from flask import Flask, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Find user in database
    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

    # Generate JWT token
    access_token = create_access_token(identity=user.id)

    return jsonify({
        'token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
    }), 200
```

### Example 3: Java / Spring Boot

```java
@PostMapping("/api/auth/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    try {
        // Find user in database
        User user = userRepository.findByUsername(loginRequest.getUsername())
            .orElseThrow(() -> new Exception("Invalid credentials"));

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new Exception("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId());

        return ResponseEntity.ok(new LoginResponse(
            token,
            new UserDTO(user.getId(), user.getUsername(), user.getEmail())
        ));
    } catch (Exception e) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Invalid username or password"));
    }
}
```

---

## 🔐 CORS Configuration

Your backend needs CORS enabled:

### Express.js

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Flask

```python
from flask_cors import CORS

CORS(app, origins=['http://localhost:3000'])
```

### Spring Boot

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("*")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

## 🔒 JWT Token Handling

### Token Format

Tokens are JWT format with Bearer prefix:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Frontend automatically adds this header.

### Token Storage

Tokens stored in localStorage:

```javascript
// Check token
localStorage.getItem('authToken')

// Clear token
localStorage.removeItem('authToken')

// Clear all
localStorage.clear()
```

### Token Expiration

When token expires:

1. Frontend still sends it
2. Backend returns 401
3. Frontend could refresh or redirect to login

### Token Refresh (Optional)

For better UX, implement token refresh:

```javascript
// In authService.js - add refresh method
refreshToken: async () => {
  const response = await apiClient.post('/api/auth/refresh');
  const newToken = response.data.token;
  localStorage.setItem('authToken', newToken);
  return newToken;
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Login

```
Input:  username=john_doe, password=correct123
Expected:
  ✓ No validation errors
  ✓ API call sent
  ✓ Response has token
  ✓ localStorage has authToken
  ✓ localStorage has user
  ✓ Redirect to /dashboard
  ✓ Dashboard shows username
```

### Scenario 2: Invalid Username

```
Input:  username=ab, password=correct123
Expected:
  ✓ Shows validation error
  ✓ No API call
  ✓ Button disabled
```

### Scenario 3: Invalid Password

```
Input:  username=john_doe, password=wrong
Expected:
  ✓ Shows validation error
  ✓ No API call
```

### Scenario 4: API Error

```
Input:  username=john_doe, password=incorrect
Expected:
  ✓ API called
  ✓ Returns 401
  ✓ Shows error message
  ✓ Stays on login page
  ✓ localStorage empty
```

### Scenario 5: Logout

```
Action: Click logout
Expected:
  ✓ localStorage cleared
  ✓ Redirect to /login
  ✓ authToken gone
  ✓ user gone
```

### Scenario 6: Protected Route Access

```
Action: Try accessing /dashboard without login
Expected:
  ✓ ProtectedRoute checks auth
  ✓ isAuthenticated() returns false
  ✓ Redirect to /login
```

---

## 🐛 Debugging Tips

### Check Token

```javascript
// In browser console
localStorage.getItem('authToken')
JSON.parse(localStorage.getItem('user'))
```

### Check API Call

1. Open DevTools (F12)
2. Go to Network tab
3. Submit login form
4. Look for request to `/api/auth/login`
5. Check Request body
6. Check Response body
7. Check Response status

### Check Component State

```javascript
// Add in LoginPage.js
useEffect(() => {
  console.log('Form data:', formData);
  console.log('Errors:', errors);
  console.log('Is loading:', isLoading);
}, [formData, errors, isLoading]);
```

### Check Auth Service

```javascript
// In browser console
import authService from './services/authService'
authService.isAuthenticated() // true/false
authService.getCurrentUser()  // user object or null
```

---

## 📝 Customization

### Change Validation Rules

Edit `src/pages/LoginPage.js` or `src/utils/validation.js`:

```javascript
// Example: Require email instead of username
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email' };
  }
  return { isValid: true, error: '' };
};
```

### Change API Endpoint

Edit `src/services/authService.js`:

```javascript
login: async (username, password) => {
  const response = await apiClient.post('/your/custom/endpoint', {
    username,
    password,
  });
  // ... rest of code
}
```

### Change Styling

Edit CSS files in `src/pages/`:

```css
/* LoginPage.css - change colors */
.login-card {
  background: #your-color;
}

.submit-button {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Add More Fields

1. Update form state in LoginPage.js
2. Add input field to JSX
3. Add validation function
4. Update API call payload

---

## 🚀 Deployment Preparation

### Before Deploying

- [ ] Update `REACT_APP_API_URL` to production server
- [ ] Remove console.log statements
- [ ] Test login on production server
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Test error handling
- [ ] Performance test with large numbers of users

### Build for Production

```bash
npm run build
```

This creates an optimized production build in `build/` folder.

### Deploy

Deploy the `build/` folder contents to your hosting:

```bash
# Using various hosting platforms
# Vercel: vercel
# Netlify: netlify deploy --prod --dir=build
# AWS S3: aws s3 sync build/ s3://your-bucket
```

---

## 📞 Support

For issues:

1. Check browser console for errors
2. Check Network tab in DevTools
3. Check the documentation files
4. Look at EXAMPLES.md for code patterns
5. Check TROUBLESHOOTING section

---

## ✅ Integration Checklist

Before going to production:

- [ ] Backend `/api/auth/login` endpoint ready
- [ ] CORS configured
- [ ] JWT token generation working
- [ ] Database credentials validation working
- [ ] Frontend URL configured in `.env`
- [ ] All test scenarios passing
- [ ] Error handling tested
- [ ] Responsive design tested
- [ ] Browser console clean (no errors)
- [ ] Network requests correct
- [ ] localStorage working
- [ ] Token refresh strategy (if needed)
- [ ] Session timeout strategy
- [ ] Production URL ready

---

## 🎉 You're Ready!

Once all above steps are complete, your login system is ready for production! 🚀

**Questions?** Check the documentation files in the project root.
