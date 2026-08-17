import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { NotificationService } from "../services/notificationService";
import { AppError } from "../middleware/errorHandler";
import ResponseHandler from "../utils/responseHandler";

export class NotificationController {
  static async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const unreadOnly = req.query.unreadOnly === "true";

      const result = await NotificationService.getNotifications(userId, {
        page,
        limit,
        unreadOnly,
      });

      const pagination = ResponseHandler.buildPagination(
        page,
        limit,
        result.total,
      );
      ResponseHandler.paginated(
        res,
        result.data,
        pagination,
        "Notifications fetched successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const count = await NotificationService.getUnreadCount(userId);
      ResponseHandler.success(res, { count });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const id = req.params.id as string;
      const notification = await NotificationService.markAsRead(id, userId);
      ResponseHandler.success(res, notification, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const count = await NotificationService.markAllAsRead(userId);
      ResponseHandler.success(
        res,
        { count },
        `${count} notifications marked as read`,
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const id = req.params.id as string;
      await NotificationService.deleteNotification(id, userId);
      ResponseHandler.success(res, null, "Notification deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
