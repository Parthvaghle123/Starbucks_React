# Investigation - Admin Table Heading Styles

## Bug Summary
The table headings in the Admin Users page and the Admin Orders page (specifically the order details modal) do not have the requested black background and white text color.

## Root Cause Analysis
The current CSS styles for these tables use light backgrounds (e.g., `#f5f5f5` or gradients) and dark text colors (e.g., `#333` or `#495057`).

## Affected Components
- `starbucks-frontend/src/admin/Users.css`
- `starbucks-frontend/src/admin/Orders.css`

## Implementation Notes
- Updated `Users.css` to set `.table thead` background to `black` and `.table th` color to `white !important`.
- Updated `Orders.css` to set `.items-table-modal thead` background to `black` and `.items-table-modal th` color to `white !important`.
- Updated `Orders.css` to set `.t1 thead th` and `.table thead th` color to `white !important` for consistency.

