# Feature Specification: Universal Product Search

## User Stories

### User Story 1 - Global Search Access
**Acceptance Scenarios**:
1. **Given** a user is on any page (Home, Menu, Gift, Login, Register, etc.), **When** they look at the navbar, **Then** they should see a search input field.
2. **Given** a user is on the Login page, **When** they see the navbar, **Then** they should be able to interact with the search input.

### User Story 2 - Triggering Search
**Acceptance Scenarios**:
1. **Given** a user has entered "coffee" in the search input, **When** they press "Enter" or click the search button, **Then** they should be redirected to `/search?q=coffee`.
2. **Given** a user is typing in the search input, **When** they haven't pressed "Enter" or clicked the button, **Then** no redirection should occur.

### User Story 3 - Search Results Display
**Acceptance Scenarios**:
1. **Given** a user is on the Search page with `?q=latte`, **When** matching products exist in the backend, **Then** those products should be displayed.
2. **Given** a user is on the Search page with `?q=nonexistent`, **When** no products match the query, **Then** a "No products found." message should be displayed.
3. **Given** a user is on the Search page with an empty query `?q=`, **When** the page loads, **Then** no products should be displayed (show a prompt to enter a search term instead).

---

## Requirements
1. **Global Search Component**: A search input must be present in the `Navbar` and visible on every page.
2. **Redirection Logic**: Searching must redirect the user to `/search?q={keyword}`.
3. **Backend Integration**: Product data must be fetched from `http://localhost:4500/api/products`.
4. **Search Page Logic**:
    - Extract `q` from URL query parameters.
    - If `q` is empty, do NOT display any products.
    - If `q` is not empty, perform case-insensitive matching on product names.
    - Display matching results in a grid/list format (reusing `Menu.css` styles).
    - Handle loading and error states for the API call.
5. **Stability**: Other pages (Home, Menu, Gift) must remain unaffected by the search state (only the Search page displays results).
6. **Case Sensitivity**: Matching must be case-insensitive (e.g., "MOCHA" matches "Mocha").

## Success Criteria
- [ ] Search input is visible on Login and Register pages.
- [ ] Searching "java" redirects to `/search?q=java`.
- [ ] `/search?q=java` shows only products containing "java" (case-insensitive).
- [ ] `/search` (no query) does not show products; instead prompts the user to search.
- [ ] "No products found" appears when no matches exist for a non-empty query.
- [ ] Home page UI does not change when a search is performed (other than redirection).
