---

# AgroLease - Frontend Workflow

## Introduction

This document describes the expected frontend application flow and maps each screen to the backend APIs required to implement it.

The goal is to provide a clear implementation guide for frontend developers.

---

## Complete User Journey

```
Landing Page
    ↓
Register
    ↓
Login
    ↓
Browse Equipment
    ↓
View Equipment Details
    ↓
Check Availability
    ↓
Create Booking
    ↓
Make Payment
    ↓
View Bookings
    ↓
Manage Listings (Provider)
    ↓
Admin Dashboard (Admin)
```

---

## User Roles

| Role | Pages Accessible |
|------|------------------|
| Farmer | Browse, Book, Payments, Notifications, Profile |
| Provider | All Farmer + My Listings, Manage Bookings |
| Admin | All + Admin Dashboard, User Management, Equipment Moderation |

---

## 1. Landing Page

**Purpose:** Introduce AgroLease and allow users to register or log in.

**APIs:** None

**Actions:**
- Navigate to Register
- Navigate to Login
- Browse equipment (public)

---

## 2. Register Page

**Purpose:** Create a new user account.

**API:**
```
POST /auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "9876543210",
  "firstName": "Raj",
  "lastName": "Kumar",
  "password": "Test@1234",
  "role": "farmer"
}
```

**Success:**
- Show success message
- Redirect to Login

**Failure:**
- Display validation errors
- Show duplicate email error

---

## 3. Login Page

**Purpose:** Authenticate the user.

**API:**
```
POST /auth/login
```

**Success:**
- Save JWT Token
- Save Refresh Token
- Redirect to Dashboard

**Failure:**
- Display invalid credentials message
- Show account locked message

---

## 4. Dashboard

**Purpose:** Display user overview after login.

**APIs:**
```
GET /auth/me
GET /bookings?type=renter
GET /notifications/unread-count
```

**Display:**
- User name and role
- Upcoming bookings
- Recent notifications
- Quick actions (Browse Equipment, My Bookings)

**Provider Dashboard:**
- My listings count
- Pending bookings
- Revenue summary

---

## 5. Browse Equipment

**Purpose:** View and search available equipment.

**APIs:**
```
GET /equipment
GET /equipment/categories
GET /equipment?category=tractor&city=Pune&minPrice=1000
```

**Features:**
- List equipment with pagination
- Filter by category, city, state, price range
- Search by keyword
- View equipment details

---

## 6. Equipment Details

**Purpose:** View detailed equipment information.

**APIs:**
```
GET /equipment/{id}
GET /equipment/{id}/availability?startDate=...&endDate=...
```

**Display:**
- Equipment title, description, category
- Rental price, security deposit
- Location
- Specifications (brand, model, year, power source)
- Images
- Owner information
- Availability calendar

**Actions:**
- Check availability
- Book now (redirect to booking)

---

## 7. Create Booking

**Purpose:** Book equipment for specific dates.

**API:**
```
POST /bookings
```

**Request:**
```json
{
  "equipmentId": "eq_123",
  "bookingDateStart": "2026-09-01",
  "bookingDateEnd": "2026-09-03",
  "deliveryType": "pickup",
  "notes": "Need tractor for 3 days"
}
```

**Success:**
- Redirect to Payment

---

## 8. Payment

**Purpose:** Make payment for booking.

**APIs:**
```
POST /payments/create-order
POST /payments/verify
```

**Flow:**
1. Create Razorpay order
2. Redirect to Razorpay checkout
3. User completes payment
4. Verify payment
5. Booking confirmed

**Success:**
- Show payment success
- Redirect to My Bookings

**Failure:**
- Show payment failed
- Allow retry

---

## 9. My Bookings

**Purpose:** View all bookings.

**APIs:**
```
GET /bookings?type=renter
GET /bookings?type=owner
GET /bookings/{id}
```

**Display:**
- Booking status (pending, confirmed, active, completed, cancelled)
- Equipment details
- Dates
- Total price
- Payment status

**Actions (Owner):**
- Confirm pending booking
- Complete active booking

**Actions (Renter):**
- Cancel booking

---

## 10. My Listings (Provider)

**Purpose:** Manage equipment listings.

**APIs:**
```
GET /equipment/my/listings
POST /equipment
PUT /equipment/{id}
DELETE /equipment/{id}
```

**Features:**
- View all listings
- Create new listing
- Edit listing
- Delete listing

---

## 11. Notifications

**Purpose:** View user notifications.

**APIs:**
```
GET /notifications
GET /notifications/unread-count
PUT /notifications/{id}/read
PUT /notifications/read-all
DELETE /notifications/{id}
```

**Display:**
- Notification list
- Unread count badge
- Mark as read
- Delete notification

---

## 12. Admin Dashboard

**Purpose:** View platform analytics.

**APIs:**
```
GET /admin/dashboard/stats
GET /admin/users
GET /admin/equipment
GET /admin/bookings
GET /admin/audit-logs
```

**Display:**
- User statistics
- Equipment statistics
- Booking statistics
- Revenue statistics

---

## 13. Admin User Management

**Purpose:** Manage platform users.

**APIs:**
```
GET /admin/users
PUT /admin/users/{id}/status
```

**Features:**
- List all users
- Search users
- Activate/Deactivate users
- View user details

---

## 14. Admin Equipment Moderation

**Purpose:** Moderate equipment listings.

**APIs:**
```
GET /admin/equipment
PUT /admin/equipment/{id}/verify
PUT /admin/equipment/{id}/reject
```

**Features:**
- List all equipment
- Filter by status
- Verify equipment
- Reject equipment with reason

---

## 15. Admin Audit Logs

**Purpose:** View admin actions.

**API:**
```
GET /admin/audit-logs
```

**Display:**
- Admin name
- Action
- Target type
- Target ID
- Reason
- Timestamp

---

## Authentication Flow

```
Register
    ↓
Login
    ↓
Receive JWT
    ↓
Store JWT (localStorage/sessionStorage)
    ↓
Attach JWT to Protected Requests
```

**Authorization Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Token Refresh:**
```
POST /auth/refresh-token
```

---

## Frontend State Management

| State | Description |
|-------|-------------|
| auth.token | JWT access token |
| auth.refreshToken | Refresh token |
| auth.user | Current user |
| equipment.list | Equipment list |
| equipment.filters | Active filters |
| bookings.list | User bookings |
| notifications.list | User notifications |
| notifications.unreadCount | Unread count |

---

## Loading States

Show loading indicators for:

- Login
- Register
- Equipment list
- Equipment details
- Create booking
- Payment
- Notifications
- Admin actions

---

## Error Handling

Handle the following gracefully:

- Validation errors (400)
- Unauthorized access (401)
- Forbidden access (403)
- Not found (404)
- Conflict (409)
- Internal server error (500)
- Network errors

**Token Expiry:**
- Intercept 401 responses
- Attempt refresh token
- If refresh fails, redirect to login

---

## Recommended Frontend Implementation Order

1. Authentication (Register, Login, Logout)
2. Browse Equipment (List, Details, Filters)
3. Booking (Create, View, Cancel)
4. Payment (Create Order, Verify)
5. Notifications (List, Mark Read, Delete)
6. My Listings (CRUD)
7. Admin Dashboard (Stats, Users, Equipment)
8. Admin Moderation (Verify, Reject)

---

**Document Version:** 1.0
**Date:** August 2026

---
