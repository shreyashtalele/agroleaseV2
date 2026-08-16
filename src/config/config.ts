import dotenv from "dotenv";

dotenv.config();

export default {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  apiVersion: process.env.API_VERSION || "v1",
  appName: process.env.APP_NAME || "AgroLease",

  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/agrolease",
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    },
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret:
      process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret-change-me",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ],
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15", 10) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || "30", 10),
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10),
    lockTimeMinutes: parseInt(process.env.LOCK_TIME_MINUTES || "15", 10),
  },

  admin: {
    email: process.env.ADMIN_EMAIL || "admin@agrolease.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
    firstName: process.env.ADMIN_FIRST_NAME || "Super",
    lastName: process.env.ADMIN_LAST_NAME || "Admin",
  },
};
