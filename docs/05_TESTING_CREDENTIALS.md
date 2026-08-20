---

# AgroLease - Testing Credentials & Environment Setup

## Introduction

This document provides test credentials and environment setup instructions for frontend developers.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Development API | `http://localhost:5000/api/v1` |
| Swagger Documentation | `http://localhost:5000/api-docs` |
| Health Check | `http://localhost:5000/health` |

---

## Test Accounts

### Admin User

| Field | Value |
|-------|-------|
| Email | `admin@agrolease.com` |
| Password | `Admin@123` |
| Role | `admin` |

**Capabilities:**
- Full system access
- User management
- Equipment moderation
- View audit logs
- Dashboard analytics

---

### Equipment Provider

| Field | Value |
|-------|-------|
| Email | `provider1@agrolease.com` |
| Password | `Provider@123` |
| Role | `provider` |

**Capabilities:**
- List equipment
- Manage listings
- Confirm bookings
- Complete bookings
- View own bookings

---

### Farmer (Renter)

| Field | Value |
|-------|-------|
| Email | `farmer1@agrolease.com` |
| Password | `Farmer@123` |
| Role | `farmer` |

**Capabilities:**
- Browse equipment
- Create bookings
- Make payments
- View notifications
- Manage profile

---

## Test Equipment

| Field | Value |
|-------|-------|
| ID | `6a8437cb9ddd8e1ec2a354d9` |
| Title | `Test Tractor` |
| Category | `tractor` |
| Price | `1500` |

---

## Test Booking

| Field | Value |
|-------|-------|
| ID | `6a8438eb9ddd8e1ec2a354da` |
| Status | `confirmed` |
| Price | `3000` |

---

## Test Payment

| Field | Value |
|-------|-------|
| Order ID | `order_TQRVOWaKOxeFld` |
| Amount | `3000` |
| Status | `success` |

---

## Razorpay Test Cards

| Card Type | Card Number | CVV | Expiry | OTP |
|-----------|-------------|-----|--------|-----|
| Success (Visa) | `4111 1111 1111 1111` | `123` | Any future | `1234` |
| Success (Mastercard) | `5555 5555 5555 4444` | `123` | Any future | `1234` |
| 3D Secure Auth | `5267 3181 8790 1025` | `123` | Any future | `1234` |
| Failure | `4000 0000 0000 0002` | `123` | Any future | `1234` |

---

## Environment Variables

Create `.env.local` in frontend project:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TQRMl7TrIvN4aS
```

---

## Quick Test Commands

**Test Health:**
```bash
curl http://localhost:5000/health
```

**Test Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agrolease.com","password":"Admin@123"}'
```

**Test Equipment List:**
```bash
curl http://localhost:5000/api/v1/equipment
```

---

## Swagger Documentation

```
http://localhost:5000/api-docs
```

Use Swagger to:
- View all endpoints
- Test APIs directly
- See request/response schemas
- Copy example payloads

---

## Frontend Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with test account
- [ ] Logout
- [ ] Token refresh
- [ ] Protected route access

### Equipment
- [ ] Browse equipment list
- [ ] Filter by category
- [ ] Search equipment
- [ ] View equipment details
- [ ] Check availability

### Booking
- [ ] Create booking
- [ ] View bookings
- [ ] Cancel booking
- [ ] Confirm booking (Provider)
- [ ] Complete booking (Provider)

### Payment
- [ ] Create order
- [ ] Make payment (test cards)
- [ ] Verify payment
- [ ] View payment history

### Notifications
- [ ] View notifications
- [ ] Mark as read
- [ ] Check unread count

### Admin
- [ ] View dashboard
- [ ] View users
- [ ] Activate/Deactivate users
- [ ] View equipment
- [ ] Verify equipment
- [ ] View audit logs

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check MONGODB_URI in .env |
| Redis connection error | Start Redis server locally |
| Razorpay payment fails | Use test card numbers |
| JWT token expired | Call refresh token endpoint |
| 401 Unauthorized | Check Authorization header |
| 403 Forbidden | Check user role permissions |

---

## Support

For issues, provide:
- Endpoint called
- Request payload
- Response received
- Correlation ID (from response)

---

**Document Version:** 1.0
**Date:** August 2026

---

## Final Document List

| # | Document | Status |
|---|----------|--------|
| 1 | Project Overview | ✅ Done |
| 2 | API Reference | ✅ Done |
| 3 | Frontend Workflow | ✅ Done |
| 4 | Error Handling Guide | ✅ Done |
| 5 | Testing Credentials | ✅ Done |

---

