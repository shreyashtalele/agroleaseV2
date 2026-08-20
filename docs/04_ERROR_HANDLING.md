---

# AgroLease - Error Handling Guide

## Introduction

This document defines how the frontend should handle API errors returned by the AgroLease backend.

The objective is to provide a consistent and user-friendly experience across the application.

---

## Standard Error Response

All backend errors follow the same structure.

```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Error message"
  },
  "timestamp": "2026-08-20T10:00:00.000Z",
  "correlationId": "abc-123-def"
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_VALIDATION",
    "message": "Validation failed",
    "details": [
      {
        "type": "field",
        "value": "invalid",
        "msg": "Email is required",
        "path": "email",
        "location": "body"
      }
    ]
  }
}
```

---

## HTTP Status Codes

| Status | Meaning | Frontend Action |
|--------|---------|-----------------|
| 200 | Success | Continue workflow |
| 201 | Created | Show success message |
| 204 | No Content | Continue |
| 400 | Validation Error | Display validation errors |
| 401 | Unauthorized | Redirect to Login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show "Not Found" message |
| 409 | Conflict | Show conflict message |
| 429 | Too Many Requests | Ask user to retry later |
| 500 | Internal Server Error | Show generic error |

---

## Error Codes

| Code | HTTP Status | Description | Frontend Action |
|------|-------------|-------------|-----------------|
| ERR_VALIDATION | 400 | Validation failed | Display field errors |
| ERR_UNAUTHORIZED | 401 | Authentication required | Redirect to login |
| ERR_FORBIDDEN | 403 | Insufficient permissions | Show permission error |
| ERR_NOT_FOUND | 404 | Resource not found | Show not found |
| ERR_CONFLICT | 409 | Resource conflict | Show conflict message |
| ERR_DUPLICATE_KEY | 409 | Duplicate entry | Show duplicate error |
| ERR_TOKEN_EXPIRED | 401 | Token expired | Refresh token / Redirect login |
| ERR_TOKEN_INVALID | 401 | Invalid token | Redirect to login |
| ERR_ACCOUNT_LOCKED | 403 | Account locked | Show locked message |
| ERR_INVALID_CREDENTIALS | 401 | Invalid credentials | Show invalid credentials |
| ERR_INTERNAL | 500 | Server error | Show generic error |
| ERR_EQUIPMENT_UNAVAILABLE | 400 | Equipment not available | Show unavailable message |
| ERR_BOOKING_CONFLICT | 409 | Booking conflict | Show conflict message |
| ERR_PAYMENT_FAILED | 400 | Payment failed | Show payment failed |

---

## Validation Errors (400)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_VALIDATION",
    "message": "Validation failed",
    "details": [
      {
        "type": "field",
        "value": "",
        "msg": "Email is required",
        "path": "email",
        "location": "body"
      },
      {
        "type": "field",
        "value": "123",
        "msg": "Password must be at least 8 characters",
        "path": "password",
        "location": "body"
      }
    ]
  }
}
```

**Frontend should:**
- Highlight invalid fields
- Display validation messages below corresponding inputs
- Keep user-entered values
- Prevent page refresh

---

## Unauthorized (401)

**Possible Reasons:**
- Missing JWT token
- Expired JWT token
- Invalid JWT token

**Frontend should:**
- Clear stored authentication data
- Redirect to Login page
- Show session expired notification
- **Do not** keep retrying the same request

**Intercept 401 globally:**
```javascript
// Example interceptor
if (response.status === 401) {
  try {
    // Attempt refresh token
    await refreshToken();
    // Retry original request
  } catch {
    // Redirect to login
    localStorage.clear();
    window.location.href = '/login';
  }
}
```

---

## Forbidden (403)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_FORBIDDEN",
    "message": "You are not authorized to perform this action"
  }
}
```

**Frontend should:**
- Show permission error message
- Redirect to appropriate page (e.g., dashboard)
- Disable buttons user doesn't have access to

---

## Resource Not Found (404)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_NOT_FOUND",
    "message": "Equipment not found"
  }
}
```

**Frontend should:**
- Display "Resource not found" message
- Redirect to list page after a moment
- Provide link to go back

---

## Conflict (409)

**Examples:**
- Email already exists
- Equipment already booked for dates
- Duplicate entry

**Frontend should:**
- Display the backend message
- Allow user to modify conflicting field
- Highlight conflicting field if applicable

---

## Too Many Requests (429)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

**Frontend should:**
- Show notification
- Disable repeated submissions temporarily (15 minutes)
- Allow retry after delay

---

## Internal Server Error (500)

**Frontend should:**
- Display generic error message
- Allow user to retry
- **Never** expose technical details

**Recommended message:**
```
Something went wrong. Please try again.
```

---

## Payment Failed (400)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_PAYMENT_FAILED",
    "message": "Payment verification failed"
  }
}
```

**Frontend should:**
- Show payment failed message
- Allow user to retry payment
- Provide support contact if needed

---

## Equipment Unavailable (400)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_EQUIPMENT_UNAVAILABLE",
    "message": "Equipment is already booked for selected dates"
  }
}
```

**Frontend should:**
- Display availability message
- Suggest alternative dates
- Allow user to modify booking dates

---

## Booking Conflict (409)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_BOOKING_CONFLICT",
    "message": "Booking cannot be confirmed (status: confirmed)"
  }
}
```

**Frontend should:**
- Display current booking status
- Disable conflicting actions
- Refresh booking status

---

## Account Locked (403)

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "ERR_ACCOUNT_LOCKED",
    "message": "Account is temporarily locked. Please try after 15 minutes"
  }
}
```

**Frontend should:**
- Show locked message with time
- Disable login button
- Notify user to try again after 15 minutes

---

## Network Errors

**Examples:**
- No internet connection
- Backend server unavailable
- DNS failure

**Frontend should:**
- Detect network failure
- Show offline message
- Allow retry when connection is restored

**Recommended message:**
```
Unable to connect to the server. Please check your internet connection.
```

---

## Loading States

Show loading indicators for:

- Login
- Registration
- Equipment list
- Equipment details
- Create booking
- Payment
- Notifications
- Admin actions
- Profile update

**Best Practice:**
- Disable action buttons during loading
- Show spinner or skeleton screens
- Prevent duplicate submissions

---

## Success Messages

| Action | Suggested Message |
|--------|-------------------|
| Register | Account created successfully. Please login. |
| Login | Login successful. |
| Equipment Created | Equipment listed successfully. |
| Equipment Updated | Equipment updated successfully. |
| Equipment Deleted | Equipment deleted successfully. |
| Booking Created | Booking created successfully. Please complete payment. |
| Booking Confirmed | Booking confirmed successfully. |
| Booking Cancelled | Booking cancelled successfully. |
| Payment Success | Payment successful. Booking confirmed. |
| Profile Updated | Profile updated successfully. |
| Password Changed | Password changed successfully. |
| Notification Marked Read | Notification marked as read. |
| Admin User Activated | User activated successfully. |
| Admin Equipment Verified | Equipment verified successfully. |

---

## Frontend Best Practices

1. Always display backend error messages to users
2. Never expose raw server errors or stack traces
3. Preserve user input after recoverable errors
4. Use loading indicators for long-running requests
5. Intercept 401 globally for token refresh
6. Show retry options for temporary failures
7. Log unexpected errors for debugging
8. Use `correlationId` for support requests

---

## Example: Error Handler in React

```javascript
// Example error handling function
function handleApiError(error) {
  const statusCode = error.response?.status;
  const data = error.response?.data;

  // Network error
  if (!error.response) {
    showToast('Network error. Please check your connection.');
    return;
  }

  // Unauthorized - redirect to login
  if (statusCode === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  // Validation errors
  if (statusCode === 400 && data?.error?.details) {
    data.error.details.forEach((detail) => {
      setFieldError(detail.path, detail.msg);
    });
    return;
  }

  // Show error message
  showToast(data?.error?.message || 'Something went wrong.');
}
```

---

## Summary

The frontend should prioritize clear communication with users by:

- Showing meaningful validation feedback
- Handling authentication failures gracefully
- Providing retry options for temporary issues
- Displaying consistent success and error messages
- Using `correlationId` for debugging support requests

---

**Document Version:** 1.0
**Date:** August 2026

