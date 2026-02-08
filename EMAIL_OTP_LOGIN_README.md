# Email OTP Login System Implementation

## Overview
This implementation adds email OTP verification to the existing login system. Users must verify their identity with a 6-digit OTP sent to their email after entering correct credentials.

## Flow
1. User enters email and password
2. Backend validates credentials
3. If valid, generates 6-digit OTP and sends to user's email
4. User enters OTP on verification page
5. Backend verifies OTP and issues JWT token
6. User is redirected to home page

## Backend Changes

### New Endpoints
- `POST /login` - Modified to send OTP instead of direct login
- `POST /verify-login-otp` - Verifies OTP and completes login
- `POST /resend-login-otp` - Resends OTP to user's email

### Email Configuration
- Uses existing Nodemailer setup
- Sends HTML formatted emails with OTP
- 5-minute expiration for OTPs

## Frontend Changes

### New Components
- `OTPVerification.jsx` - Handles OTP input and verification
- Updated `Login.jsx` - Redirects to OTP page after credential validation

### Features
- 6-digit OTP input with validation
- Countdown timer for resend functionality
- Error handling and loading states
- Responsive design matching existing UI

## Security Features
- OTP expires in 5 minutes
- One-time use OTPs (deleted after verification)
- Secure email delivery
- JWT token generation after successful verification

## Usage
1. Start the backend server: `npm start` in `/starbucks-backend`
2. Start the frontend: `npm run dev` in `/starbucks-frontend`
3. Navigate to login page and enter credentials
4. Check email for OTP and enter on verification page

## Email Template
The OTP email includes:
- Starbucks branding
- Clear OTP display
- Security warnings
- Professional HTML formatting

## Error Handling
- Invalid credentials
- Expired/invalid OTP
- Network errors
- Email delivery failures

## Dependencies
All required dependencies are already installed:
- Backend: nodemailer, bcrypt, jsonwebtoken
- Frontend: axios, react-router-dom, bootstrap