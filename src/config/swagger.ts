import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AgroLease API",
      version: "1.0.0",
      description: "Farming Equipment Rental Marketplace API",
      contact: {
        name: "AgroLease Team",
        email: "support@agrolease.com",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string" },
            phoneNumber: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["farmer", "provider", "admin"] },
            isVerified: { type: "boolean" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Equipment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            rentalPricePerDay: { type: "number" },
            sellingPrice: { type: "number" },
            securityDeposit: { type: "number" },
            quantity: { type: "number" },
            status: {
              type: "string",
              enum: ["available", "rented", "under_maintenance", "sold"],
            },
            location: {
              type: "object",
              properties: {
                city: { type: "string" },
                state: { type: "string" },
                pincode: { type: "string" },
              },
            },
            specifications: {
              type: "object",
              properties: {
                brand: { type: "string" },
                model: { type: "string" },
                modelYear: { type: "number" },
                powerSource: { type: "string" },
                horsepower: { type: "number" },
              },
            },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  isPrimary: { type: "boolean" },
                },
              },
            },
            owner: { type: "string" },
            isVerified: { type: "boolean" },
            viewsCount: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            equipment: { type: "string" },
            renter: { type: "string" },
            owner: { type: "string" },
            bookingDateStart: { type: "string", format: "date" },
            bookingDateEnd: { type: "string", format: "date" },
            totalPrice: { type: "number" },
            securityDeposit: { type: "number" },
            status: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "active",
                "completed",
                "cancelled",
                "failed",
              ],
            },
            payment: {
              type: "object",
              properties: {
                status: { type: "string" },
                razorpayOrderId: { type: "string" },
                razorpayPaymentId: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            booking: { type: "string" },
            user: { type: "string" },
            razorpayOrderId: { type: "string" },
            razorpayPaymentId: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "success", "failed", "refunded"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            message: { type: "string" },
            read: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
            timestamp: { type: "string", format: "date-time" },
            correlationId: { type: "string" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "array" },
            pagination: {
              type: "object",
              properties: {
                page: { type: "number" },
                limit: { type: "number" },
                total: { type: "number" },
                totalPages: { type: "number" },
                hasNext: { type: "boolean" },
                hasPrev: { type: "boolean" },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Equipment", description: "Equipment management endpoints" },
      { name: "Bookings", description: "Booking management endpoints" },
      { name: "Payments", description: "Payment endpoints" },
      { name: "Notifications", description: "Notification endpoints" },
      { name: "Admin", description: "Admin management endpoints" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const specs = swaggerJsdoc(options);
