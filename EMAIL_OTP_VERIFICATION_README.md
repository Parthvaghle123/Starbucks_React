# Email OTP Verification System

This system implements a complete email OTP verification flow for user registration.

## Flow Overview

1. **User Registration**: User fills out registration form with name, email, password, etc.
2. **OTP Generation**: Backend generates a 6-digit OTP and sends it to user's email
3. **Email Verification**: User enters OTP to verify their email address
4. **Account Activation**: Once verified, user can login and access the application

## API Endpoints

### Registration with OTP
- **POST** `/register-with-otp`
- Creates user account (unverified) and sends OTP email
- Body: `{ username, email, password, phone, gender, dob, address, country_code }`

### Verify Registration OTP
- **POST** `/verify-registration-otp`
- Verifies OTP and marks user as verified
- Body: `{ email, otp }`
- Returns JWT token on success

### Resend Registration OTP
- **POST** `/resend-registration-otp`
- Resends OTP to user's email
- Body: `{ email }`

## Frontend Components

### Register.jsx
- Updated to use `/register-with-otp` endpoint
- Redirects to OTP verification page after successful registration

### OTPVerification.jsx
- New component for OTP input and verification
- Features:
  - 6-digit OTP input with auto-focus
  - Resend OTP functionality with countdown
  - Error handling and success messages

### Login.jsx
- Updated to handle unverified users
- Redirects to OTP verification if email not verified

## Database Changes

### User Model
- Added `isVerified: Boolean` field (default: false)
- Users must verify email before login

### OTP Model
- Stores email and OTP with 5-minute expiry
- Automatically cleaned up after expiration

## Email Configuration

Uses Nodemailer with Gmail SMTP:
- Service: Gmail
- Authentication: App password required
- HTML email templates with Starbucks branding

## Security Features

- OTP expires in 5 minutes
- Passwords hashed with bcrypt
- JWT tokens for authentication
- Email validation and sanitization
- Rate limiting on OTP requests

## Usage

1. Start backend: `cd starbucks-backend && npm start`
2. Start frontend: `cd starbucks-frontend && npm run dev`
3. Register new user → Verify email → Login → Access home page

## Environment Variables

Backend requires:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
SECRET_KEY=your-jwt-secret
```