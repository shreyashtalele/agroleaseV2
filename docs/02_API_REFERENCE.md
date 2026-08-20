---

# AgroLease - API Reference

## Base URL

```
http://localhost:5000/api/v1
```

---

## Authentication

**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Error message"
  }
}
```

### Paginated
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 1. Authentication APIs

### Register User

**POST** `/auth/register`

**Auth:** Not Required

**Content-Type:** `application/json`

**Request:**
```json
{
  "email": "farmer@example.com",
  "phoneNumber": "9876543210",
  "firstName": "Raj",
  "lastName": "Kumar",
  "password": "Test@1234",
  "role": "farmer"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "farmer@example.com",
      "firstName": "Raj",
      "lastName": "Kumar",
      "role": "farmer",
      "phoneNumber": "9876543210",
      "isVerified": false
    },
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Common Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Validation Error |
| 409 | Email already exists |

---

### Login User

**POST** `/auth/login`

**Auth:** Not Required

**Content-Type:** `application/json`

**Request:**
```json
{
  "email": "farmer@example.com",
  "password": "Test@1234"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": "user_123",
      "email": "farmer@example.com",
      "firstName": "Raj",
      "lastName": "Kumar",
      "role": "farmer",
      "phoneNumber": "9876543210",
      "isVerified": false
    },
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Common Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Validation Error |
| 401 | Invalid Credentials |
| 403 | Account Locked |

---

### Refresh Token

**POST** `/auth/refresh-token`

**Auth:** Not Required

**Content-Type:** `application/json`

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Get Profile

**GET** `/auth/me`

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "farmer@example.com",
    "firstName": "Raj",
    "lastName": "Kumar",
    "role": "farmer",
    "phoneNumber": "9876543210",
    "isVerified": false,
    "isActive": true
  }
}
```

---

### Update Profile

**PUT** `/auth/me`

**Auth:** Required

**Content-Type:** `application/json`

**Request:**
```json
{
  "firstName": "UpdatedName",
  "lastName": "UpdatedLastName",
  "phoneNumber": "9876543211"
}
```

---

### Change Password

**PUT** `/auth/change-password`

**Auth:** Required

**Content-Type:** `application/json`

**Request:**
```json
{
  "currentPassword": "Test@1234",
  "newPassword": "NewTest@1234"
}
```

---

### Logout

**POST** `/auth/logout`

**Auth:** Required

---

## 2. Equipment APIs

### List Equipment

**GET** `/equipment`

**Auth:** Not Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | integer | Page number |
| limit | integer | Items per page |
| category | string | Filter by category |
| city | string | Filter by city |
| state | string | Filter by state |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| search | string | Search keyword |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "eq_123",
      "title": "Mahindra Tractor",
      "category": "tractor",
      "rentalPricePerDay": 1500,
      "location": {
        "city": "Pune",
        "state": "Maharashtra"
      },
      "owner": {
        "firstName": "Raj",
        "lastName": "Kumar"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### Create Equipment

**POST** `/equipment`

**Auth:** Required (Provider)

**Content-Type:** `application/json`

**Request:**
```json
{
  "title": "Mahindra Tractor",
  "description": "Powerful 50HP tractor",
  "category": "tractor",
  "rentalPricePerDay": 1500,
  "securityDeposit": 5000,
  "quantity": 2,
  "location": {
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001"
  },
  "specifications": {
    "brand": "Mahindra",
    "model": "575 DI",
    "modelYear": 2021,
    "powerSource": "diesel",
    "horsepower": 50
  }
}
```

---

### Get Equipment by ID

**GET** `/equipment/{id}`

**Auth:** Not Required

---

### Update Equipment

**PUT** `/equipment/{id}`

**Auth:** Required (Owner only)

**Request:**
```json
{
  "title": "Updated Title",
  "rentalPricePerDay": 1800,
  "status": "available"
}
```

---

### Delete Equipment

**DELETE** `/equipment/{id}`

**Auth:** Required (Owner only)

---

### Get Categories

**GET** `/equipment/categories`

**Auth:** Not Required

**Response:**
```json
{
  "success": true,
  "data": ["tractor", "harvester", "plow", "cultivator", "seeder", "sprayer", "irrigation", "baler", "combine", "mower", "other"]
}
```

---

### Get My Listings

**GET** `/equipment/my/listings`

**Auth:** Required

---

### Check Availability

**GET** `/equipment/{id}/availability?startDate=2026-09-01&endDate=2026-09-03`

**Auth:** Not Required

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

---

## 3. Booking APIs

### Create Booking

**POST** `/bookings`

**Auth:** Required

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

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "book_123",
    "status": "pending",
    "totalPrice": 3000
  }
}
```

---

### List Bookings

**GET** `/bookings?type=renter&status=pending`

**Auth:** Required

**Query Parameters:**
| Parameter | Values | Description |
|-----------|--------|-------------|
| type | renter / owner | View as renter or owner |
| status | pending / confirmed / active / completed / cancelled | Filter by status |

---

### Get Booking by ID

**GET** `/bookings/{id}`

**Auth:** Required

---

### Confirm Booking

**PUT** `/bookings/{id}/confirm`

**Auth:** Required (Owner only)

---

### Complete Booking

**PUT** `/bookings/{id}/complete`

**Auth:** Required (Owner only)

---

### Cancel Booking

**PUT** `/bookings/{id}/cancel`

**Auth:** Required

**Request:**
```json
{
  "reason": "Changed plans"
}
```

---

## 4. Payment APIs

### Create Order

**POST** `/payments/create-order`

**Auth:** Required

**Request:**
```json
{
  "bookingId": "book_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 3000,
    "currency": "INR",
    "keyId": "rzp_test_xxx"
  }
}
```

---

### Verify Payment

**POST** `/payments/verify`

**Auth:** Required

**Request:**
```json
{
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "signature": "signature_xxx"
}
```

---

### Payment History

**GET** `/payments/history`

**Auth:** Required

---

### Get Payment by Order ID

**GET** `/payments/order/{orderId}`

**Auth:** Required

---

### Get Payment by Booking ID

**GET** `/payments/booking/{bookingId}`

**Auth:** Required

---

## 5. Notification APIs

### List Notifications

**GET** `/notifications?unreadOnly=true`

**Auth:** Required

---

### Get Unread Count

**GET** `/notifications/unread-count`

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### Mark as Read

**PUT** `/notifications/{id}/read`

**Auth:** Required

---

### Mark All as Read

**PUT** `/notifications/read-all`

**Auth:** Required

---

### Delete Notification

**DELETE** `/notifications/{id}`

**Auth:** Required

---

## 6. Admin APIs

### Dashboard Stats

**GET** `/admin/dashboard/stats`

**Auth:** Required (Admin)

---

### List Users

**GET** `/admin/users`

**Auth:** Required (Admin)

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| page | Page number |
| limit | Items per page |
| search | Search by name/email |
| role | farmer / provider / admin |
| isActive | true / false |

---

### Update User Status

**PUT** `/admin/users/{id}/status`

**Auth:** Required (Admin)

**Request:**
```json
{
  "isActive": false,
  "reason": "Inappropriate behavior"
}
```

---

### List Equipment (Admin)

**GET** `/admin/equipment`

**Auth:** Required (Admin)

---

### Verify Equipment

**PUT** `/admin/equipment/{id}/verify`

**Auth:** Required (Admin)

---

### Reject Equipment

**PUT** `/admin/equipment/{id}/reject`

**Auth:** Required (Admin)

**Request:**
```json
{
  "reason": "Images are not clear"
}
```

---

### List Bookings (Admin)

**GET** `/admin/bookings`

**Auth:** Required (Admin)

---

### Audit Logs

**GET** `/admin/audit-logs`

**Auth:** Required (Admin)

---

## Swagger Documentation

Complete API documentation is available at:

```
http://localhost:5000/api-docs
```

---

**Document Version:** 1.0
**Date:** August 2026

---

