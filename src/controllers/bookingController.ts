import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { BookingService } from "../services/bookingService";
import { AppError } from "../middleware/errorHandler";
import ResponseHandler from "../utils/responseHandler";

export class BookingController {
  static async createBooking(req: Request, res: Response, next: NextFunction) {
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

      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const booking = await BookingService.createBooking(req.body, userId);
      ResponseHandler.created(res, booking, "Booking created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const status = (req.query.status as string) || undefined;
      const type = (req.query.type as "renter" | "owner") || "renter";

      let result;
      if (type === "owner") {
        result = await BookingService.getOwnerBookings(userId, {
          page,
          limit,
          status,
        });
      } else {
        result = await BookingService.getRenterBookings(userId, {
          page,
          limit,
          status,
        });
      }

      const pagination = ResponseHandler.buildPagination(
        page,
        limit,
        result.total,
      );
      ResponseHandler.paginated(res, result.data, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const booking = await BookingService.getBookingById(id, userId);
      ResponseHandler.success(res, booking);
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction) {
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

      const id = req.params.id as string;
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const reason = req.body.reason;
      const booking = await BookingService.cancelBooking(id, userId, reason);
      ResponseHandler.success(res, booking, "Booking cancelled successfully");
    } catch (error) {
      next(error);
    }
  }

  static async confirmBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const booking = await BookingService.confirmBooking(id, userId);
      ResponseHandler.success(res, booking, "Booking confirmed successfully");
    } catch (error) {
      next(error);
    }
  }

  static async completeBooking(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const booking = await BookingService.completeBooking(id, userId);
      ResponseHandler.success(res, booking, "Booking completed successfully");
    } catch (error) {
      next(error);
    }
  }
}
