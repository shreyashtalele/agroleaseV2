import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { AppError } from "./errorHandler";
import { ERROR_CODES } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Authentication required",
        401,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      throw new AppError(
        "Invalid or expired token",
        401,
        ERROR_CODES.TOKEN_INVALID,
      );
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(
          "Authentication required",
          401,
          ERROR_CODES.UNAUTHORIZED,
        );
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError(
          "Insufficient permissions",
          403,
          ERROR_CODES.FORBIDDEN,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
