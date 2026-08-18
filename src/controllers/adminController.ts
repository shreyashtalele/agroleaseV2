import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AdminService } from "../services/adminService";
import { AppError } from "../middleware/errorHandler";
import ResponseHandler from "../utils/responseHandler";

export class AdminController {
  static async getDashboardStats(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const stats = await AdminService.getDashboardStats();
      ResponseHandler.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
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

      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const search = req.query.search as string;
      const role = req.query.role as string;
      const isActive =
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
            ? false
            : undefined;

      const result = await AdminService.getUsers({
        page,
        limit,
        search,
        role,
        isActive,
      });
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

  static async updateUserStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
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

      const userId = req.params.id as string;
      const adminId = (req as any).user.id;
      const { isActive, reason } = req.body;

      const user = await AdminService.updateUserStatus(
        userId,
        isActive,
        adminId,
        reason,
      );
      ResponseHandler.success(
        res,
        user,
        `User ${isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
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

      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const search = req.query.search as string;
      const status = req.query.status as string;
      const isVerified =
        req.query.isVerified === "true"
          ? true
          : req.query.isVerified === "false"
            ? false
            : undefined;

      const result = await AdminService.getEquipmentList({
        page,
        limit,
        search,
        status,
        isVerified,
      });
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

  static async verifyEquipment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
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

      const equipmentId = req.params.id as string;
      const adminId = (req as any).user.id;
      const { reason } = req.body;

      const equipment = await AdminService.verifyEquipment(
        equipmentId,
        adminId,
        reason,
      );
      ResponseHandler.success(
        res,
        equipment,
        "Equipment verified successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  static async rejectEquipment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
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

      const equipmentId = req.params.id as string;
      const adminId = (req as any).user.id;
      const { reason } = req.body;

      const equipment = await AdminService.rejectEquipment(
        equipmentId,
        adminId,
        reason,
      );
      ResponseHandler.success(
        res,
        equipment,
        "Equipment rejected successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
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

      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const adminId = req.query.adminId as string;
      const targetType = req.query.targetType as string;
      const action = req.query.action as string;

      const result = await AdminService.getAuditLogs({
        page,
        limit,
        adminId,
        targetType,
        action,
      });
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

  static async getBookings(req: Request, res: Response, next: NextFunction) {
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

      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await AdminService.getBookings({
        page,
        limit,
        status,
        search,
      });
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
}
