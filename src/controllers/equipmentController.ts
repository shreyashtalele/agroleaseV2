import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { EquipmentService } from "../services/equipmentService";
import { AppError } from "../middleware/errorHandler";
import ResponseHandler from "../utils/responseHandler";

export class EquipmentController {
  static async createEquipment(
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

      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }
      const equipment = await EquipmentService.createEquipment(
        req.body,
        userId,
      );

      ResponseHandler.created(res, equipment);
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

      const options = {
        page,
        limit,
        category: (req.query.category as string) || undefined,
        city: (req.query.city as string) || undefined,
        state: (req.query.state as string) || undefined,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        status: (req.query.status as string) || undefined,
        search: (req.query.search as string) || undefined,
        sort: (req.query.sort as string) || undefined,
      };

      const { data, total } = await EquipmentService.getEquipmentList(options);
      const pagination = ResponseHandler.buildPagination(page, limit, total);

      ResponseHandler.paginated(res, data, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id as string;
      const equipment = await EquipmentService.getEquipmentById(id);

      ResponseHandler.success(res, equipment);
    } catch (error) {
      next(error);
    }
  }

  static async updateEquipment(
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

      const id = req.params.id as string;
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }
      const equipment = await EquipmentService.updateEquipment(
        id,
        req.body,
        userId,
      );

      ResponseHandler.success(res, equipment, "Equipment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteEquipment(
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
      await EquipmentService.deleteEquipment(id, userId);

      ResponseHandler.success(res, null, "Equipment deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyListings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const status = (req.query.status as string) || undefined;

      const { data, total } = await EquipmentService.getMyListings(userId, {
        page,
        limit,
        status,
      });
      const pagination = ResponseHandler.buildPagination(page, limit, total);

      ResponseHandler.paginated(res, data, pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await EquipmentService.getCategories();
      ResponseHandler.success(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async checkAvailability(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        throw new AppError(
          "startDate and endDate are required",
          400,
          "ERR_VALIDATION",
        );
      }

      const result = await EquipmentService.checkAvailability(
        id,
        new Date(startDate),
        new Date(endDate),
      );

      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
