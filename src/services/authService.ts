import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { ERROR_CODES } from "../middleware/errorHandler";
import config from "../config/config";
import redis from "../config/redis";
import logger from "../config/logger";
import { EmailService } from "./emailService";
import crypto from "crypto";

interface RegisterData {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: "farmer" | "provider";
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static async revokeRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const client = redis.getClient();
    if (client) {
      const key = `blacklist:refresh:${userId}`;
      await client.setEx(key, 60 * 60 * 24 * 30, token);
    }
  }

  static async isRefreshTokenRevoked(
    userId: string,
    token: string,
  ): Promise<boolean> {
    const client = redis.getClient();
    if (!client) return false;
    const key = `blacklist:refresh:${userId}`;
    const stored = await client.get(key);
    return stored === token;
  }

  static async blacklistToken(_userId: string, token: string): Promise<void> {
    const client = redis.getClient();
    if (client) {
      const key = `blacklist:access:${token}`;
      await client.setEx(key, 60 * 60 * 24 * 7, "true");
    }
  }

  static async register(data: RegisterData): Promise<IUser> {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
    });

    if (existingUser) {
      throw new AppError(
        "User with this email or phone already exists",
        409,
        ERROR_CODES.CONFLICT,
      );
    }

    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = new User({
      email: data.email,
      phoneNumber: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      role: data.role || "farmer",
    });

    await user.save();

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error: any) {
      logger.error(
        "Failed to send verification email:",
        error.message || error,
      );
    }

    return user;
  }

  static async verifyEmail(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({ verificationToken: hashedToken });

    if (!user) {
      throw new AppError(
        "Invalid or expired verification token",
        400,
        ERROR_CODES.TOKEN_INVALID,
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return true;
  }

  static async login(
    data: LoginData,
  ): Promise<{ user: IUser; token: string; refreshToken: string }> {
    const user = await User.findOne({ email: data.email }).select("+password");

    if (!user) {
      throw new AppError(
        "Invalid credentials",
        401,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new AppError(
        "Account is temporarily locked",
        403,
        ERROR_CODES.ACCOUNT_LOCKED,
      );
    }

    const isPasswordMatch = await user.comparePassword(data.password);

    if (!isPasswordMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= config.security.maxLoginAttempts) {
        user.lockUntil = new Date(
          Date.now() + config.security.lockTimeMinutes * 60 * 1000,
        );
      }

      await user.save({ validateBeforeSave: false });
      throw new AppError(
        "Invalid credentials",
        401,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    return { user, token, refreshToken };
  }

  static async refreshToken(
    refreshToken: string,
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded: any = jwt.verify(refreshToken, config.jwt.refreshSecret);

      const revoked = await this.isRefreshTokenRevoked(
        decoded.id,
        refreshToken,
      );
      if (revoked) {
        throw new AppError(
          "Refresh token revoked",
          401,
          ERROR_CODES.TOKEN_INVALID,
        );
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError(
          "Invalid refresh token",
          401,
          ERROR_CODES.TOKEN_INVALID,
        );
      }

      await this.revokeRefreshToken(decoded.id, refreshToken);

      const newToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new AppError(
        "Invalid refresh token",
        401,
        ERROR_CODES.TOKEN_INVALID,
      );
    }
  }

  static async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
    }

    return user;
  }

  static async updateProfile(userId: string, data: any): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
    }

    const allowedFields = ["firstName", "lastName", "phoneNumber", "address"];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        (user as any)[field] = data[field];
      }
    }

    await user.save();

    return user;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
    }

    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      throw new AppError(
        "Current password is incorrect",
        401,
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    }

    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
  }
}
