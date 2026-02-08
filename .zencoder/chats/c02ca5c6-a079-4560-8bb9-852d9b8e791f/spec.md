# Technical Specification: Conditional Profile Completion on First Google Login

## Technical Context

**Language/Version**: 
- Frontend: React 19 (Vite)
- Backend: Node.js/Express
- Database: MongoDB (Mongoose)
- Authentication: Passport.js with Google OAuth2

**Primary Dependencies**:
- Frontend: React Router, Axios, Bootstrap
- Backend: Express, Passport, JWT, Mongoose, dotenv, CORS

## Technical Implementation Brief

The feature is **partially implemented** in the codebase:

1. **Backend** (index.js:40-104): Google OAuth strategy already creates users with `phone`, `gender`, `dob`, `address` fields set to `null`
2. **Backend** (index.js:77-78): Profile completion check logic exists and determines redirect page
3. **Backend** (index.js:171-198): Profile update endpoint already exists
4. **Frontend** (Login.jsx:81): Currently ignores the `redirectPage` parameter and always navigates to `/home`

**Key Issue**: The frontend needs to be updated to respect the `redirectPage` parameter sent by the backend in the Google OAuth callback.

**Implementation Approach**:
- Update Login.jsx to capture and use the `redirectPage` parameter from the postMessage event
- Verify the profile completion check logic considers all required fields (phone, gender, dob) - address may be optional for MVP
- Ensure Profile.jsx handles first-time completion flow with appropriate messaging
- Test end-to-end flow for both first-time and returning users

## Source Code Structure

```
starbucks-backend/
├── index.js                      (Google OAuth routes, profile endpoints)
├── models/
│   └── userSchema.js            (User model with profile fields)
└── auth.js                       (JWT authentication middleware)

starbucks-frontend/
├── src/
│   ├── Login.jsx                (Google login handler - needs update)
│   ├── Profile.jsx              (Profile completion form)
│   ├── Home.jsx                 (Home page after login)
│   └── App.jsx                  (Route configuration)
```

## Contracts

### API Endpoints (Already Exist)

#### 1. GET `/user/profile`
**Purpose**: Fetch user profile data  
**Auth**: JWT Token (Bearer)  
**Response**:
```json
{
  "_id": "user_id",
  "googleId": "google_id",
  "username": "User Name",
  "email": "user@example.com",
  "image": "profile_image_url",
  "country_code": "+91",
  "phone": "9999999999" | null,
  "gender": "male" | "female" | "other" | null,
  "dob": "2000-01-01T00:00:00.000Z" | null,
  "address": "Full Address" | null,
  "isFirstLogin": true | false
}
```

#### 2. PUT `/user/profile`
**Purpose**: Update user profile  
**Auth**: JWT Token (Bearer)  
**Request Body**:
```json
{
  "username": "Updated Name",
  "phone": "9999999999",
  "gender": "male" | "female" | "other",
  "dob": "2000-01-01",
  "address": "Full Address"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

#### 3. GET `/auth/google/callback`
**Purpose**: Google OAuth callback  
**Response**: HTML page with postMessage containing:
```javascript
{
  token: "jwt_token",
  username: "User Name",
  redirectPage: "home" | "profile"  // Conditional based on profile completion
}
```

### Data Model Changes

**User Schema (userSchema.js)** - Already has all required fields:
```javascript
{
  googleId: String,
  username: String,
  email: String (unique),
  image: String,
  country_code: String (default: "+91"),
  phone: String (default: null),
  gender: String (enum: ['male', 'female', 'other'], default: null),
  dob: Date (default: null),
  address: String (default: null),
  age: Number (auto-calculated),
  isFirstLogin: Boolean (default: true)
}
```

### Frontend Component Contracts

#### Login.jsx Updates
**Input**: 
- `setUsername` prop (function to set username in parent)

**Output**:
- On successful Google login, postMessage is received with `{ token, username, redirectPage }`
- Navigate to `/profile` if `redirectPage === "profile"`, otherwise navigate to `/home`
- Store token and username in localStorage

#### Profile.jsx Behavior
**Current State**: Already handles profile completion and has proper validation  
**Required Enhancement**:
- Detect if user came from first-time Google login
- Display appropriate messaging for first-time completion
- After submission, navigate to `/home`

## Delivery Phases

### Phase 1: Frontend Google OAuth Redirect Logic (MVP)
**Deliverable**: Update Login.jsx to respect the `redirectPage` parameter from backend  
**Changes**:
- Modify `handleMessage` function to capture and use `redirectPage`
- Navigate to `/profile` or `/home` based on the parameter
- Ensure token and username are stored correctly

**Verification**:
- Manual testing with Google OAuth callback
- Verify first-time users are redirected to `/profile`
- Verify returning users are redirected to `/home`

### Phase 2: Profile Completion Flow Enhancement
**Deliverable**: Enhance Profile.jsx to handle first-time completion with better UX  
**Changes**:
- Add `isFirstLogin` detection from backend
- Display "Complete Your Profile" heading for first-time users
- Optional: Show a progress indicator
- Ensure form validation is strict for first-time users

**Verification**:
- Fill profile form and verify data is saved
- Verify successful submission navigates to `/home`
- Verify error messages display correctly for validation failures

### Phase 3: End-to-End Testing & Bug Fixes
**Deliverable**: Verify complete flow works correctly  
**Test Scenarios**:
1. First-time Google login → redirected to Profile → complete profile → redirected to Home
2. Return Google login with complete profile → redirected directly to Home
3. Logout and re-login with same Google account → redirected to Home (not Profile)
4. Profile update after first completion → changes persist on re-login

## Verification Strategy

### Manual Testing Steps

#### Test 1: First-Time Google Login Flow
```bash
1. Open application in incognito/private mode
2. Click "Sign In With Google" on Login page
3. Complete Google OAuth authentication
4. Verify redirected to Profile page
5. Fill in all fields (phone, gender, DOB, address)
6. Click Submit
7. Verify redirected to Home page
```

#### Test 2: Returning User with Complete Profile
```bash
1. Using same Google account from Test 1
2. Logout
3. Click "Sign In With Google" on Login page
4. Complete Google OAuth authentication
5. Verify redirected to Home page (NOT Profile)
```

#### Test 3: Update Profile After Initial Completion
```bash
1. On Home page, navigate to Profile
2. Click "Edit Profile"
3. Change one field (e.g., phone number)
4. Submit changes
5. Verify success message
6. Logout and re-login with Google
7. Verify changes persisted (redirect to Home, profile shows updated info)
```

### Automated Testing
- Run existing test suite: `npm run test` (if available)
- Check for any regression in authentication flow

### Browser Console Verification
- Verify token is stored in localStorage
- Verify username is stored in localStorage
- Check Network tab to confirm API calls are made with correct headers
- Monitor console for any JavaScript errors

### Backend Verification
- Check MongoDB to verify user documents have correct profile fields
- Verify profile completion check logic: `phone && gender && dob && address`

## Implementation Notes

- **Address field**: Currently included in profile completion check. If this should be optional for MVP, the backend check at index.js:77 should be updated to remove `address` from the condition.
- **isFirstLogin flag**: Available in User Schema but not currently used. Can be implemented for better UX if needed.
- **Security**: Google credentials are hardcoded in index.js:21-22. Should be moved to .env file.
