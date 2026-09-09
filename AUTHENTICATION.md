# Admin Authentication System - Implementation Guide

## Overview
This authentication system provides secure admin user registration and login for the Toy Station Management System using:
- **MongoDB** for data persistence
- **bcrypt** for password hashing
- **JWT** for session management
- **HTTP-only cookies** for secure token storage

## Features

✅ **No Email Verification Required**
- Users can log in immediately after signing up
- Email is optional during registration

✅ **Secure Password Storage**
- Passwords are hashed using bcrypt (10 salt rounds)
- Passwords are never stored in plain text
- Automatic hashing before saving to database

✅ **JWT Authentication**
- Tokens expire after 7 days
- Stored in HTTP-only, Secure, SameSite cookies
- Verified on protected routes

✅ **Session Management**
- Users remain logged in after closing the browser (within 7 days)
- Automatic logout on token expiration
- Manual logout clears the cookie

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

Required packages added:
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT token generation and verification

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/toy-station

# JWT Secret Key - Change this to a strong random string in production
JWT_SECRET=your-secret-key-change-in-production
```

**For MongoDB Atlas (Production):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toy-station?retryWrites=true&w=majority
JWT_SECRET=use-a-strong-random-string-here
```

### 3. Database Setup
Ensure MongoDB is running:

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Create a cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Add it to `.env.local`

## File Structure

```
project-root/
├── lib/
│   ├── mongodb.js           # MongoDB connection utility
│   └── auth.js              # JWT token utilities
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   └── Admin.js             # Admin user model with password hashing
├── pages/
│   ├── api/auth/
│   │   ├── register.js      # POST endpoint for registration
│   │   ├── login.js         # POST endpoint for login
│   │   ├── logout.js        # POST endpoint for logout
│   │   └── me.js            # GET endpoint to verify auth
│   ├── auth/
│   │   ├── register.js      # Registration page (UI)
│   │   └── login.js         # Login page (UI)
│   └── dashboard.js         # Protected dashboard page
├── styles/
│   └── auth.module.css      # Authentication page styles
├── .env.local               # Environment variables (NOT in git)
└── .env.local.example       # Template for .env.local
```

## API Endpoints

### Register Admin
**POST** `/api/auth/register`

Request:
```json
{
  "username": "admin",
  "password": "securepassword",
  "email": "admin@example.com" // optional
}
```

Response (201):
```json
{
  "message": "Admin registered successfully",
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login Admin
**POST** `/api/auth/login`

Request:
```json
{
  "username": "admin",
  "password": "securepassword"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout Admin
**POST** `/api/auth/logout`

Response (200):
```json
{
  "message": "Logged out successfully"
}
```

### Get Current Admin
**GET** `/api/auth/me`

Response (200):
```json
{
  "admin": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

## Usage Examples

### Protecting Routes with Middleware
```javascript
import { withAuth } from '../middleware/auth';

export default withAuth(async (req, res) => {
  // req.admin contains { id, username }
  return res.status(200).json({ message: 'Protected endpoint', admin: req.admin });
});
```

### Making Authenticated Requests from Frontend
```javascript
import axios from 'axios';

// Login
const response = await axios.post('/api/auth/login', {
  username: 'admin',
  password: 'password'
});

// Cookie is automatically set and sent with subsequent requests
const me = await axios.get('/api/auth/me'); // Sends cookie automatically

// Logout
await axios.post('/api/auth/logout');
```

## Security Features

✅ **Password Security**
- bcrypt hashing with salt rounds: 10
- Passwords never logged or exposed

✅ **Token Security**
- Tokens stored in HTTP-only cookies (not accessible via JavaScript)
- Secure flag set for HTTPS in production
- SameSite=Strict prevents CSRF attacks
- Automatic expiration after 7 days

✅ **Database Protection**
- MongoDB connection cached to prevent connection leaks
- Error messages don't expose internal details
- Username uniqueness enforced at database level

## Testing the System

### 1. Register a New Admin
Navigate to: `http://localhost:3000/auth/register`
- Enter username (min 3 chars)
- Enter password (min 6 chars)
- Email is optional

### 2. Login
Navigate to: `http://localhost:3000/auth/login`
- Enter registered username and password

### 3. Access Dashboard
After login, you'll be redirected to: `http://localhost:3000/dashboard`
- Shows current admin information
- Contains logout button

### 4. Test Protected Routes
Try accessing `/dashboard` without logging in → redirects to login

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use MongoDB Atlas for production database
- [ ] Enable HTTPS (Vercel handles this automatically)
- [ ] Add rate limiting to `/api/auth/*` endpoints
- [ ] Implement password strength validation
- [ ] Add email verification (optional enhancement)
- [ ] Set up monitoring and logging
- [ ] Test all auth flows thoroughly
- [ ] Review security headers configuration

## Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running locally or MongoDB Atlas is accessible
- Check `MONGODB_URI` in `.env.local`
- Verify network connectivity to MongoDB Atlas

### "JWT verification failed"
- Check that `JWT_SECRET` matches between registration and login
- Ensure token hasn't expired (7 days)
- Clear browser cookies and try logging in again

### "Username already exists"
- The username is already taken in the database
- Try registering with a different username

### CORS or Cookie Issues
- Verify cookies are being set in browser dev tools (Application > Cookies)
- Check that requests include credentials: `{ withCredentials: true }`

## Next Steps

1. **Add Password Reset**: Implement forgot password functionality
2. **Email Verification** (Optional): Add email confirmation step
3. **Two-Factor Authentication**: Enhance security with 2FA
4. **Role-Based Access Control**: Add admin roles and permissions
5. **Audit Logging**: Log all admin actions for compliance

---

**Created**: 2026-09-09
**Repository**: maxhar518/toy-station-management-system
