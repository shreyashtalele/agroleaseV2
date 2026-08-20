---

# AgroLease - Backend Project Overview

## Introduction

AgroLease is a farming equipment rental marketplace platform that connects farmers with equipment providers.

The backend provides REST APIs that allow users to:

- Register and authenticate securely
- Manage their profile
- List equipment for rent or sale
- Browse and search available equipment
- Book equipment for specific dates
- Make secure payments via Razorpay
- Receive in-app notifications
- Admin manage users, equipment, and view analytics

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Cache | Redis |
| Auth | JWT + bcrypt |
| Payment | Razorpay |
| Logging | Winston |
| Validation | express-validator |
| Docs | Swagger / OpenAPI |

---

## Base URLs

```
Development API: http://localhost:5000/api/v1
Swagger Docs:    http://localhost:5000/api-docs
Health Check:    http://localhost:5000/health
```

---

## Authentication

Most endpoints require authentication.

After login, you receive:
- Access Token (expires in 7 days)
- Refresh Token (expires in 30 days)

**Send token in header:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Modules

### 1. Authentication
- Register user
- Login user
- Refresh token
- Logout
- Get profile
- Update profile
- Change password

### 2. Equipment
- Create equipment
- Update equipment
- Delete equipment
- List equipment (with filters)
- Get equipment by ID
- Get my listings
- Get categories
- Check availability

### 3. Bookings
- Create booking
- Confirm booking (Owner only)
- Complete booking (Owner only)
- Cancel booking
- List bookings
- Get booking by ID

### 4. Payments
- Create Razorpay order
- Verify payment
- Razorpay webhook
- Payment history
- Get payment by order ID
- Get payment by booking ID

### 5. Notifications
- List notifications
- Get unread count
- Mark as read
- Mark all as read
- Delete notification

### 6. Admin
- Dashboard stats
- List users
- Activate/Deactivate users
- List equipment
- Verify equipment
- Reject equipment
- List bookings
- Audit logs

---

## User Roles

| Role | Access |
|------|--------|
| Farmer | Browse, book, pay, notifications |
| Provider | All farmer + list equipment, manage bookings |
| Admin | Full system access |

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Error message"
  }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| ERR_VALIDATION | 400 | Validation failed |
| ERR_UNAUTHORIZED | 401 | Authentication required |
| ERR_FORBIDDEN | 403 | Insufficient permissions |
| ERR_NOT_FOUND | 404 | Resource not found |
| ERR_CONFLICT | 409 | Resource conflict |
| ERR_TOKEN_EXPIRED | 401 | Token expired |
| ERR_INTERNAL | 500 | Server error |

---

## Frontend Notes

1. Send JWT in `Authorization: Bearer <token>` header
2. Use `application/json` for all APIs
3. Handle token expiry with refresh token
4. Use `correlationId` for debugging
5. Check `success: false` for errors

---

## Environment Variables

| Variable | Required |
|----------|----------|
| PORT | Yes |
| MONGODB_URI | Yes |
| REDIS_URL | Yes |
| JWT_SECRET | Yes |
| REFRESH_TOKEN_SECRET | Yes |
| RAZORPAY_KEY_ID | Yes |
| RAZORPAY_KEY_SECRET | Yes |

---

**Document Version:** 1.0
**Date:** August 2026

For API details, see Swagger at `/api-docs`.

---

