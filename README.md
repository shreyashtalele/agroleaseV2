# AgroLease Backend API

## 🚀 Farming Equipment Rental Marketplace

### Tech Stack
- Node.js + Express
- MongoDB Atlas
- Redis
- JWT Authentication
- Razorpay Payment Gateway
- Winston Logging

### Setup

1. Install dependencies:
npm install

2. Configure environment:
Create .env file with your values.

3. Start server:
npm run dev

### API Endpoints

#### Health Check
- GET /health - Server health status

### Project Structure

backend/
├── src/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── app.js
├── logs/
├── uploads/
├── tests/
└── server.js

### License
MIT