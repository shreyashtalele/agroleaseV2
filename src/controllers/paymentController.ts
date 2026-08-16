import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { PaymentService } from "../services/paymentService";
import { AppError } from "../middleware/errorHandler";
import ResponseHandler from "../utils/responseHandler";
import config from "../config/config";

export class PaymentController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
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

      const { bookingId } = req.body;
      const result = await PaymentService.createOrder({ bookingId, userId });

      ResponseHandler.success(res, {
        orderId: result.order.id,
        amount: result.order.amount,
        currency: result.order.currency,
        keyId: config.razorpay.keyId,
        payment: result.payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
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

      const { orderId, paymentId, signature } = req.body;
      const payment = await PaymentService.verifyPayment({
        orderId,
        paymentId,
        signature,
      });

      ResponseHandler.success(res, payment, "Payment verified successfully");
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      if (!signature) {
        throw new AppError(
          "Webhook signature missing",
          401,
          "ERR_UNAUTHORIZED",
        );
      }

      await PaymentService.handleWebhook(req.body, signature);
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentHistory(
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

      const result = await PaymentService.getPaymentHistory(userId, {
        page,
        limit,
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

  static async getPaymentByOrderId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const orderId = req.params.orderId as string;
      const payment = await PaymentService.getPaymentByOrderId(orderId);

      ResponseHandler.success(res, payment);
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentByBookingId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const bookingId = req.params.bookingId as string;
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401, "ERR_UNAUTHORIZED");
      }

      const payment = await PaymentService.getPaymentByBookingId(
        bookingId,
        userId,
      );
      ResponseHandler.success(res, payment);
    } catch (error) {
      next(error);
    }
  }
}
