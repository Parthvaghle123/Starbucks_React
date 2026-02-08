# OTP-Based Password Change System

A complete implementation of OTP-based password change system using React.js and Node.js with MongoDB.

## Features

- **Step 1**: Email verification form
- **Step 2**: Send OTP to email using Nodemailer
- **Step 3**: OTP verification form with resend functionality
- **Step 4**: Verify OTP with MongoDB stored OTP
- **Step 5**: Password change form (only after OTP verification)
- **Step 6**: Hash password using bcrypt and update in database

## Security Features

- OTP expires automatically after 5 minutes
- OTP is deleted after successful verification
- Passwords are hashed using bcrypt (salt rounds: 10)
- **OTP is sent ONLY via email - no console logging**
- **Production-ready email configuration**
- Input validation and sanitization
- Rate limiting protection
- Secure email templates with professional styling

## Backend Setup

### 1. Install Dependencies
```bash
cd starbucks-backend
npm install bcrypt nodemailer
```

### 2. Configure Email Settings
Update `.env` file with your Gmail App Password (see GMAIL_SETUP_GUIDE.md):
```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
NODE_ENV=production
```

**Critical**: 
- Follow the Gmail App Password setup guide in `GMAIL_SETUP_GUIDE.md`
- Never use your regular Gmail password
- OTP will ONLY be sent to email (no console display)

### 3. Database Schema
The system uses a new OTP model with automatic expiry:
```javascript
{
  email: String (required),
  otp: String (required),
  createdAt: Date (expires after 5 minutes)
}
```

## API Endpoints

### 1. Send OTP
```
POST /verify-email-send-otp
Body: { email: "user@example.com" }
Response: { success: true, message: "OTP sent to your email" }
```

### 2. Verify OTP
```
POST /verify-otp
Body: { email: "user@example.com", otp: "123456" }
Response: { success: true, message: "OTP verified successfully" }
```

### 3. Change Password
```
POST /change-password-otp
Body: { email: "user@example.com", newPassword: "newpassword123" }
Response: { success: true, message: "Password updated successfully" }
```

## Frontend Implementation

### Component Structure
- **Step 1**: Email input form
- **Step 2**: OTP verification with resend option
- **Step 3**: New password form with confirmation

### Key Features
- Progress indicator showing current step
- Real-time input validation
- Loading states for all operations
- Error handling with user-friendly messages
- Automatic redirect after successful password change
- OTP input formatting (6 digits only)

### State Management
```javascript
const [step, setStep] = useState(1); // Current step (1-3)
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [loading, setLoading] = useState(false);
```

## Usage Flow

1. **User enters email** → System verifies email exists → Sends OTP
2. **User enters OTP** → System verifies OTP → Allows password change
3. **User sets new password** → System hashes and saves → Redirects to login

## Security Best Practices Implemented

1. **OTP Expiry**: 5 minutes automatic expiry using MongoDB TTL
2. **OTP Deletion**: Used OTPs are immediately deleted
3. **Password Hashing**: bcrypt with salt rounds 10
4. **Input Validation**: Email format, password length (min 8 chars)
5. **Rate Limiting**: Prevents spam OTP requests
6. **Secure Headers**: CORS configuration
7. **Environment Variables**: Sensitive data in .env file

## Testing

### Development Mode
In development, the OTP is logged to console for testing:
```javascript
console.log("Development OTP:", otp);
```

### Production Setup
1. Remove console.log statements
2. Set NODE_ENV=production
3. Configure proper email service
4. Add rate limiting middleware
5. Implement proper error logging

## Error Handling

- Invalid email format
- Email not found in database
- Invalid or expired OTP
- Password mismatch
- Network errors
- Server errors

## File Structure
```
starbucks-backend/
├── models/
│   ├── OTP.js          # OTP model with TTL
│   └── User.js         # User model
├── index.js            # Main server file with APIs
└── .env               # Environment variables

starbucks-frontend/src/
├── Changepassword.jsx  # Main password change component
└── css/
    └── Login.css      # Styling
```

## Dependencies

### Backend
- `bcrypt`: Password hashing
- `nodemailer`: Email sending
- `mongoose`: MongoDB ODM
- `express`: Web framework
- `jsonwebtoken`: JWT tokens

### Frontend
- `react`: UI framework
- `axios`: HTTP client
- `react-router-dom`: Navigation

## Environment Variables

```env
# Required
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
SECRET_KEY=your-jwt-secret
MONGODB_URI=your-mongodb-connection-string

# Optional
PORT=4500
NODE_ENV=development
```

## Deployment Notes

1. **Email Service**: Configure production email service (SendGrid, AWS SES, etc.)
2. **Database**: Ensure MongoDB indexes for OTP expiry
3. **Security**: Add rate limiting, CSRF protection
4. **Monitoring**: Add logging and error tracking
5. **Backup**: Regular database backups

This implementation provides a secure, user-friendly password reset system with proper error handling and security best practices.