# API Documentation

## Auth
- POST /api/auth/register
- POST /api/auth/verify-registration
- POST /api/auth/login
- POST /api/auth/verify-login
- POST /api/auth/resend-otp
- GET /api/auth/profile
- PUT /api/auth/profile
- PUT /api/auth/change-password

## Tenders
- GET /api/tenders?keyword=&state=&category=&status=&department=&page=&limit=
- GET /api/tenders/:id
- POST /api/tenders/save
- GET /api/tenders/saved
- POST /api/tenders/keywords
- GET /api/tenders/keywords
- DELETE /api/tenders/keywords/:id

## Admin
- GET /api/admin/dashboard
- POST /api/admin/tenders
- PUT /api/admin/tenders/:id
- DELETE /api/admin/tenders/:id
- GET /api/admin/customers
- PATCH /api/admin/customers/:id/toggle
- GET /api/admin/enquiries

## Payments
- POST /api/payments/create-order
- POST /api/payments/verify
- GET /api/payments/history

## Notifications
- GET /api/notifications
- PATCH /api/notifications/:id/read
