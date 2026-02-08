# Feature development workflow

---

## Workflow Steps

### [x] Step: Requirements
Completed. PRD saved in `requirements.md`.

### [x] Step: Technical Specification
Completed. Spec saved in `spec.md`.

### [x] Step: Implementation Plan
Completed. Plan updated below.

---

## Implementation Tasks

### [x] Step: 1. Ensure Global Navbar Visibility
Update `src/App.jsx` to ensure the `Navbar` component is rendered on all pages, including Login, Register, and Profile, as per the new requirement for global search access.
- **Contract**: `src/App.jsx`
- **Deliverable**: Navbar visible on `/login`, `/register`, etc.
- **Verification**: Check if the navbar is rendered when navigating to `/login`.

### [x] Step: 2. Implement Search Redirection in Navbar
Update `src/Navbar.jsx` to correctly capture search input and redirect to `/search?q={query}` on form submission.
- **Contract**: `src/Navbar.jsx`
- **Deliverable**: Form submission redirects to the correct URL.
- **Verification**: Type "coffee" in the search box and press Enter. Verify URL is `/search?q=coffee`.

### [x] Step: 3. Implement Search Page Logic
Update `src/Search.jsx` to:
- Fetch all products from `http://localhost:4500/api/products`.
- Extract `q` from the URL.
- If `q` is empty, display a "Please enter a search term" message and NO products.
- If `q` is not empty, filter products by name (case-insensitive).
- Display matching products using existing `Menu.css` styles.
- Handle "No products found" state for non-empty queries.
- **Contract**: `src/Search.jsx`
- **Deliverable**: Functional search results page.
- **Verification**: 
  - Navigate to `/search?q=`. Verify no products are shown.
  - Navigate to `/search?q=java`. Verify only "java" products are shown.
  - Navigate to `/search?q=xyz`. Verify "No products found" message.

### [ ] Step: 4. Final Verification and Cleanup
Perform a final check across all pages to ensure search works globally and does not interfere with other page UIs. Run linting.
- **Deliverable**: Clean, bug-free search feature.
- **Verification**: `npm run lint` in `starbucks-frontend`.
