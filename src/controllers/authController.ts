import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AuthService } from "../services/authService";
import { AppError } from "../middleware/errorHandler";
import ResponseHandler from "../utils/responseHandler";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          "Validation failed",
          400,
          "ERR_VALIDATION",
          errors.array(),
        );
      }

      const user = await AuthService.register(req.body);

      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      ResponseHandler.created(res, {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          "Validation failed",
          400,
          "ERR_VALIDATION",
          errors.array(),
        );
      }

      const { user, token, refreshToken } = await AuthService.login(req.body);

      ResponseHandler.success(res, {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified,
          profileImage: user.profileImage,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          "Validation failed",
          400,
          "ERR_VALIDATION",
          errors.array(),
        );
      }

      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);

      ResponseHandler.success(res, tokens);
    } catch (error) {
      next(error);
    }
  }
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (token) {
        await AuthService.blacklistToken(userId, token);
      }

      ResponseHandler.success(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await AuthService.getProfile(userId);

      ResponseHandler.success(res, {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          "Validation failed",
          400,
          "ERR_VALIDATION",
          errors.array(),
        );
      }

      const userId = (req as any).user.id;
      const user = await AuthService.updateProfile(userId, req.body);

      ResponseHandler.success(res, {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          "Validation failed",
          400,
          "ERR_VALIDATION",
          errors.array(),
        );
      }

      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      ResponseHandler.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  }
}
