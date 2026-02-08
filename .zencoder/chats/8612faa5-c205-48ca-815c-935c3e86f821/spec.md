# Technical Specification: Universal Product Search

## Technical Context
- **Language/Version**: React (latest), JavaScript (ES6+)
- **Primary Dependencies**: `react-router-dom` for routing, `axios` for API calls, `lucide-react` or `fontawesome` for icons.
- **Backend API**: `http://localhost:4500/api/products` (returns an array of product objects with `_id`, `name`, `image`, `price`, `description`).

## Technical Implementation Brief
- **Navbar Integration**: Update `Navbar.jsx` to ensure the search input is always visible (remove conditional hiding based on routes in `App.jsx` if necessary, or adjust `App.jsx` to show it everywhere).
- **Redirection**: Use `useNavigate` in `Navbar.jsx` to redirect to `/search?q=...` on form submission.
- **Search Logic**:
    - In `Search.jsx`, use `useLocation` and `URLSearchParams` to get the `q` parameter.
    - Fetch products from the backend.
    - Filter products based on `product.name.toLowerCase().includes(q.toLowerCase())`.
    - Handle the "empty query" case by showing a prompt instead of products.
- **Styling**: Reuse `Menu.css` for the search results grid to maintain consistency.

## Source Code Structure
- `src/Navbar.jsx`: Global search input and submission logic.
- `src/Search.jsx`: Results display, filtering, and API integration.
- `src/App.jsx`: Route definition for `/search` and Navbar visibility management.

## Contracts
- **Search URL**: `/search?q={keyword}`
- **Product Model (Expected from API)**:
  ```json
  {
    "_id": "string",
    "name": "string",
    "image": "string",
    "price": "number",
    "description": "string"
  }
  ```

## Delivery Phases
1. **Phase 1: Navbar Visibility & Redirection**: Ensure the search input is visible on all pages and correctly redirects to the search page.
2. **Phase 2: Search Page Logic**: Implement API fetching and filtering based on query parameters.
3. **Phase 3: Empty Query & No Results Handling**: Add logic to handle empty queries and "No products found" scenarios.

## Verification Strategy
- **Manual Verification**:
    - Navigate to `/login` and verify search input is visible.
    - Search for a known product (e.g., "Coffee") and verify results on `/search`.
    - Search for an empty string and verify the prompt appears.
    - Search for a non-existent product and verify the "No products found" message.
- **Automated Verification**:
    - Use `npm run lint` to check for code quality.
    - (Optional) Create a simple test script if a testing framework is available (e.g., Vitest/Jest).
