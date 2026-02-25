# Login Flow & Architecture Diagrams

## 1. User Login Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    User Interaction Flow                      │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  User Visits    │
│  Application    │
└────────┬────────┘
         │
         ├──> App.js checks authService.isAuthenticated()
         │
         ├─ YES ──────────────────┐
         │                        │
         └─ NO ─────────────────┐ │
                                │ │
                         ┌──────▼─┴──┐
                         │ LoginPage  │
                         └──────┬────┘
                                │
                    ┌───────────┴────────────┐
                    │  User Enters          │
                    │  • Username           │
                    │  • Password           │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Form Validation       │
                    │ • Check username      │
                    │ • Check password      │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  All Valid?            │
                    └───────┬────────────┬───┘
                            │            │
                           YES          NO
                            │            │
                    ┌───────▼───┐  ┌─────▼──────────┐
                    │ API Call  │  │ Display Error  │
                    │ POST       │  │ Message & Stay │
                    │ /auth/login│  │ on LoginPage   │
                    └───────┬───┘  └────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │                            │
           Success                      Error
           (200)                       (401/500)
              │                            │
        ┌─────▼─────┐         ┌───────────▼──────┐
        │ Store:    │         │ Display Error:   │
        │ • Token   │         │ • "Invalid creds"│
        │ • User    │         │ • Stay on Login  │
        └─────┬─────┘         └──────────────────┘
              │
        ┌─────▼─────────┐
        │ Redirect to   │
        │ Dashboard     │
        └─────┬─────────┘
              │
        ┌─────▼─────────────────┐
        │ DashboardPage         │
        │ • Welcome message     │
        │ • User info           │
        │ • Features            │
        │ • Logout button       │
        └─────┬─────────────────┘
              │
     ┌────────┴────────┐
     │ User Actions    │
     └────────┬────────┘
              │
         Click Logout
              │
        ┌─────▼─────────┐
        │ Clear Token   │
        │ Clear User    │
        └─────┬─────────┘
              │
        ┌─────▼──────────┐
        │ Redirect to    │
        │ LoginPage      │
        └────────────────┘
```

## 2. Component Architecture

```
┌─────────────────────────────────────────────────┐
│              App.js (Router)                    │
│  • Routes setup                                 │
│  • Protected routes                             │
│  • Auth checks                                  │
└──────────┬──────────────────────┬───────────────┘
           │                      │
    ┌──────▼──────────┐    ┌──────▼──────────┐
    │   LoginPage     │    │  DashboardPage  │
    │  (Public Route) │    │ (Protected Rout)│
    │                │    │                 │
    │ • Form inputs  │    │ • User welcome  │
    │ • Validation   │    │ • Logout btn    │
    │ • API call     │    │ • Features      │
    │ • Error msgs   │    │ • User info     │
    └────────┬───────┘    └─────────────────┘
             │
      ┌──────▼────────────────┐
      │   authService.login   │
      │   (axios instance)    │
      │                       │
      │ • Token injection     │
      │ • Request/Response    │
      │   interceptors        │
      │ • localStorage        │
      │   management          │
      └──────┬────────────────┘
             │
      ┌──────▼────────────────┐
      │  Backend API Server   │
      │ /api/auth/login       │
      │  - Validates creds    │
      │  - Returns token      │
      │  - Returns user info  │
      └───────────────────────┘
```

## 3. Data Flow - Login Request

```
LoginPage.js                                    Backend API
    │                                              │
    ├─ User submits form                          │
    │                                              │
    ├─ validateForm() checks                       │
    │   • username length & format                 │
    │   • password length                          │
    │                                              │
    ├─ authService.login(user, pwd) ──────────────┼──> POST /api/auth/login
    │   • Creates axios request                    │     {username, password}
    │   • Adds headers                             │
    │                                              │
    │                                              ├─ Check credentials
    │                                              ├─ Generate JWT token
    │                                              ├─ Get user info
    │                                              │
    │  ◄──────────────────────────────────────────┤─ HTTP 200 OK
    │     {token: "JWT...", user: {...}}           │
    │                                              │
    ├─ Store token in localStorage                 │
    ├─ Store user in localStorage                  │
    │                                              │
    ├─ navigate('/dashboard')                      │
    │                                              │
    └─ DashboardPage renders                       │
       with user info                              │
```

## 4. Authentication State Management

```
App Initialization
    │
    ├─ ProtectedRoute checks auth
    │
    ├─ authService.isAuthenticated()
    │  • Checks localStorage for token
    │  • Returns boolean
    │
    ├─ If TRUE:
    │  └─ Render protected component
    │
    ├─ If FALSE:
    │  └─ Redirect to /login
    │
    └─ On every page visit:
       • Token checked
       • Automatically added to requests
       • If expired/invalid → redirect to login
```

## 5. File Organization & Dependencies

```
src/
│
├── App.js
│   └── imports: react-router-dom
│   └── uses: LoginPage, DashboardPage, authService
│
├── pages/
│   │
│   ├── LoginPage.js
│   │   ├── imports: useNavigate, authService
│   │   ├── imports: validation utilities
│   │   └── calls: authService.login()
│   │
│   └── DashboardPage.js
│       ├── imports: useNavigate, authService
│       └── uses: authService.getCurrentUser(), logout()
│
├── services/
│   │
│   └── authService.js
│       ├── imports: axios
│       ├── creates: apiClient (axios instance)
│       ├── exports: login(), logout(), getCurrentUser(), isAuthenticated()
│       └── manages: localStorage (token, user)
│
├── utils/
│   │
│   └── validation.js
│       ├── exports: validateUsername(), validatePassword(), validateEmail()
│       └── used by: LoginPage
│
└── config/
    │
    └── apiConfig.js
        ├── defines: API endpoints
        └── used by: authService
```

## 6. Token Lifecycle

```
┌─────────────────────────────────────────┐
│          Token Lifecycle                │
└─────────────────────────────────────────┘

        NOT LOGGED IN
             │
             │
        USER LOGS IN
             │
             ├─ Send credentials to /api/auth/login
             │
             ├─ Server validates
             │
             ├─ Server generates JWT token
             │
             ├─ Token sent to frontend
             │
             ├─ Token stored in localStorage
             │
             ├─ Set in request header: "Authorization: Bearer <token>"
             │
        LOGGED IN
             │
    ┌────────┴─────────┐
    │                  │
Normal Usage         Token Expires
    │                  │
Access Protected   (Automatic logout)
Routes              │
    │          Clear localStorage
Continue           │
Using App      Redirect to Login
    │                  │
    │                  └─────────┐
    │                            │
    USER LOGS OUT     (Re-login needed)
    │
    ├─ Clear token from localStorage
    │
    ├─ Clear user info from localStorage
    │
    ├─ Remove from request headers
    │
    └─ Redirect to /login
```

## 7. Request/Response Cycle

```
Frontend Request                Backend Processing

┌──────────────────┐
│ LoginPage        │
│ (User enters     │
│  credentials)    │
└────────┬─────────┘
         │
    ┌────▼──────────────────────┐
    │ validateForm()             │
    │ ✓ username valid           │
    │ ✓ password valid           │
    └────┬──────────────────────┘
         │
    ┌────▼───────────────────┐
    │ authService.login()     │
    │ Create HTTP Request     │
    └────┬───────────────────┘
         │
    ┌────▼─────────────────────────┐
    │ POST /api/auth/login         │
    │ Header: Content-Type:        │
    │         application/json     │
    │ Body: {username, password}   │
    │                              │              ┌─────────────────┐
    │                              │─────────────→│ Receive Request │
    │                              │              └────────┬────────┘
    │                              │                       │
    │                              │              ┌────────▼────────┐
    │                              │              │ Validate Creds  │
    │                              │              │ Check Database  │
    │                              │              └────────┬────────┘
    │                              │                       │
    │                              │         ┌─────────────┴──────────┐
    │                              │         │                        │
    │                              │      VALID               INVALID
    │                              │         │                    │
    │                              │    ┌────▼──────┐      ┌──────▼───┐
    │                              │    │ Generate  │      │ Return   │
    │                              │    │ JWT Token │      │ 401 Error│
    │                              │    │ Get User  │      └──────┬───┘
    │                              │    │ Info      │             │
    │                              │    └────┬──────┘             │
    │                              │         │                    │
    │ ┌─────────────────────────┐  │    ┌────▼───────┐           │
    │ │ HTTP 200 OK             │  │    │ Send       │           │
    │ │ {token: "JWT...",       │◄─┼────│ Response   │           │
    │ │  user: {...}}           │  │    └────────────┘           │
    │ └────┬────────────────────┘  │                              │
    │      │                       │     ┌──────────┐             │
    │      │                       │     │ HTTP 401 │◄────────────┤
    │      │                       │     │ {msg}    │             │
    │      │                       │     └──────┬───┘             │
    │      │                       │            │                 │
    │ ┌────▼──────────────────┐   │    ┌───────▼──────┐          │
    │ │ Store token in        │   │    │ No changes   │          │
    │ │ localStorage          │   │    │ to frontend  │          │
    │ │ Store user info       │   │    │ storage      │          │
    │ │ Add to request header │   │    └──────────────┘          │
    │ └────┬───────────────────┘  │                              │
    │      │                       │                              │
    │ ┌────▼──────────────────┐   │                              │
    │ │ navigate('/dashboard')│   │                              │
    │ └────┬───────────────────┘  │                              │
    │      │                       │                              │
    │ ┌────▼──────────────────┐   │
    │ │ Render Dashboard      │   │
    │ │ with user info        │   │
    │ └───────────────────────┘   │
```

---

## Key Points

1. **Login Flow**: Form validation → API call → Token storage → Redirect
2. **Protected Routes**: Check token exists → Allow access or redirect to login
3. **Token Management**: Stored in localStorage, added to every request automatically
4. **Error Handling**: Display user-friendly error messages
5. **Responsive**: Works on desktop, tablet, and mobile devices

---

**Reference**: Use these diagrams when integrating with your backend REST API
