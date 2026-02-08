# Technical Specification: Voice-Enabled Search Bar

## Technical Context
- **Language**: JavaScript (React)
- **Framework**: React with Vite
- **API**: Web Speech API (`window.SpeechRecognition` or `window.webkitSpeechRecognition`)
- **UI Components**: `Navbar.jsx` (Search Bar), `Menu.jsx`/`Item.jsx` (Product Filtering)

## Implementation Approach
1. **Voice Recognition Integration**:
   - Use the Web Speech API to handle voice-to-text conversion.
   - Implement a `useVoiceRecognition` hook or integrate directly into `Navbar.jsx`.
   - The recognition should start when the search input field is focused/clicked (`onFocus` or `onClick`).
   - The recognized text should update the `searchText` state in `Navbar.jsx`.

2. **UI Updates**:
   - Update `Navbar.jsx` to include an `onFocus` handler on the search input.
   - Provide visual feedback when voice recognition is active (optional but recommended, e.g., placeholder change or a small icon).

3. **Product Filtering**:
   - Leverage the existing search filtering logic in `Menu.jsx` and `Item.jsx` which already listens to URL query parameters.
   - When voice recognition completes and updates `searchText`, it should trigger the same navigation logic as manual typing to update the URL and thus filter products.

4. **Edge Cases**:
   - Handle browsers that do not support the Web Speech API.
   - Handle cases where no speech is recognized.
   - Ensure it doesn't restart indefinitely if it's already running.

## Source Code Structure Changes
- `starbucks-frontend/src/Navbar.jsx`: Add voice recognition logic and event handlers.

## Data Model / API / Interface Changes
- No changes to backend APIs or data models.
- Interface change: Search input now responds to voice input on focus.

## Verification Approach
- **Manual Testing**:
  - Click on the search input.
  - Speak a product name (e.g., "Java Chip").
  - Verify that the text appears in the search bar.
  - Verify that the products are filtered accordingly.
  - Test with a name that doesn't exist (e.g., "Pizza") to verify "Product not found" message.
- **Linting**: Run `npm run lint` in `starbucks-frontend` if available.
