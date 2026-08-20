# AgroLease Backend API

Farming Equipment Rental Marketplace Backend API

## Tech Stack

- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** MongoDB Atlas
- **Cache:** Redis
- **Auth:** JWT Authentication
- **Payments:** Razorpay Payment Gateway
- **Email:** Nodemailer
- **Logging:** Winston
- **API Docs:** Swagger

## Features

- Authentication (Register, Login, JWT, Refresh Token)
- Equipment Management (CRUD, Search, Filters)
- Booking System (Create, Confirm, Complete, Cancel)
- Payment Integration (Razorpay)
- Notifications (In-app + Email)
- Admin Dashboard
- Redis Caching
- Email Service (Verification, Password Reset, Booking Confirmation)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd agrolease-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start Redis
redis-server

# Run the development server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT secret |
| `REFRESH_TOKEN_SECRET` | Refresh token secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `SMTP_HOST` | Email host |
| `SMTP_USER` | Email user |
| `SMTP_PASS` | Email password |
| `FRONTEND_URL` | Frontend URL |

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npx tsc --noEmit   # Type check
```

## API Documentation

- **Swagger UI:** `http://localhost:5000/api-docs`
- **Base URL:** `http://localhost:5000/api/v1`

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@agrolease.com` | `Admin@123` |
| Provider | `owner@agrolease.com` | `Owner@123` |
| Farmer | `renter@agrolease.com` | `Renter@123` |

## Razorpay Test Cards

| Type | Card Number | CVV | OTP |
|---|---|---|---|
| Success | `4111 1111 1111 1111` | `123` | `1234` |
| Failure | `4000 0000 0000 0002` | `123` | `1234` |

## Project Structure

```
agrolease-backend/
├── src/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── routes/
│   ├── validators/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── docs/
├── logs/
├── uploads/
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
