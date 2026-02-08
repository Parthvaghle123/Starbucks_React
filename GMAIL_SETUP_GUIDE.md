# Gmail App Password Setup Guide

## Step-by-Step Instructions to Enable OTP Email Delivery

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the setup process to enable 2FA

### 2. Generate App Password
1. After enabling 2FA, go back to Security settings
2. Click on "App passwords" (you'll need to sign in again)
3. Select "Mail" from the dropdown
4. Click "Generate"
5. Copy the 16-digit app password (format: xxxx xxxx xxxx xxxx)

### 3. Update Environment Variables
Update your `.env` file in the backend folder:

```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

**Important Notes:**
- Use your actual Gmail address (not a placeholder)
- Use the 16-digit app password (not your regular Gmail password)
- Remove all spaces from the app password
- Keep the credentials secure and never commit them to version control

### 4. Test the Configuration
1. Start your backend server: `npm start`
2. Try the password reset feature
3. Check your email inbox for the OTP

### 5. Production Deployment
For production environments:
- Use environment variables or secure secret management
- Consider using professional email services like SendGrid or AWS SES
- Implement rate limiting for OTP requests
- Add email delivery monitoring

### Troubleshooting
- **"Invalid credentials"**: Double-check your Gmail address and app password
- **"Less secure app access"**: This is not needed with app passwords
- **OTP not received**: Check spam folder, verify email address is correct
- **Connection refused**: Ensure your server has internet access

### Security Best Practices
- Never log OTP values in production
- Use HTTPS for all API endpoints
- Implement request rate limiting
- Set appropriate CORS policies
- Use secure session management