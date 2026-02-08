# Feature Specification: Fix Order Confirmation Email

## User Stories

### User Story 1 - Order Confirmation Email
**Acceptance Scenarios**:

1. **Given** a user has items in their cart, **When** they click the "Submit Order" button, **Then** an order confirmation email should be sent to their email address.
2. **Given** an order is placed, **When** the confirmation email is received, **Then** it should contain correct order details, including Order ID, Date, Payment Method, Items Ordered, and Total Amount.

---

## Requirements
1. Fix the backend logic in `/order` endpoint to correctly send the confirmation email.
2. Ensure all variables used in the email template (like `displayPaymentMethod`, `orderItemsHtml`, `totalAmount`, etc.) are correctly defined and populated.
3. Use the correct property `html` in `mailOptions` for Nodemailer.
4. Ensure the email format is clean and professional as per the existing template.

## Success Criteria
1. Order confirmation emails are successfully sent upon order placement.
2. The email content accurately reflects the order placed.
3. No errors are logged in the backend regarding undefined variables during email generation.
