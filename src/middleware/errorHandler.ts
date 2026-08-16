import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details: any | null;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string = "INTERNAL_ERROR",
    details: any | null = null,
  ) {
    super(message);
    this.statusCode = statusCode || 500;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ERROR_CODES = {
  VALIDATION_ERROR: "ERR_VALIDATION",
  UNAUTHORIZED: "ERR_UNAUTHORIZED",
  FORBIDDEN: "ERR_FORBIDDEN",
  NOT_FOUND: "ERR_NOT_FOUND",
  CONFLICT: "ERR_CONFLICT",
  DUPLICATE_KEY: "ERR_DUPLICATE_KEY",
  TOKEN_EXPIRED: "ERR_TOKEN_EXPIRED",
  TOKEN_INVALID: "ERR_TOKEN_INVALID",
  ACCOUNT_LOCKED: "ERR_ACCOUNT_LOCKED",
  INVALID_CREDENTIALS: "ERR_INVALID_CREDENTIALS",
  DATABASE_ERROR: "ERR_DATABASE",
  INTERNAL_SERVER_ERROR: "ERR_INTERNAL",
  FILE_TOO_LARGE: "ERR_FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "ERR_INVALID_FILE_TYPE",
  UPLOAD_FAILED: "ERR_UPLOAD_FAILED",
  EQUIPMENT_UNAVAILABLE: "ERR_EQUIPMENT_UNAVAILABLE",
  BOOKING_CONFLICT: "ERR_BOOKING_CONFLICT",
  PAYMENT_FAILED: "ERR_PAYMENT_FAILED",
} as const;

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const correlationId = (req as any).correlationId || "unknown";
  const log = logger.child(correlationId);

  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  if (err.name === "ValidationError") {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = "Validation failed";
    details = Object.values(err.errors).map((e: any) => e.message);
  } else if (err.name === "CastError") {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = ERROR_CODES.DUPLICATE_KEY;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_INVALID;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
    message = "Token expired";
  }

  const logData = {
    correlationId,
    statusCode,
    errorCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id || null,
  };

  if (statusCode >= 500) {
    log.error(`[${errorCode}] ${message}`, { ...logData, stack: err.stack });
  } else {
    log.warn(`[${errorCode}] ${message}`, logData);
  }

  const response: any = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
    correlationId,
  };

  if (process.env.NODE_ENV === "development" && err.stack) {
    response.error.stack = err.stack.split("\n").slice(0, 5).join("\n");
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const err = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    ERROR_CODES.NOT_FOUND,
  );
  next(err);
};
