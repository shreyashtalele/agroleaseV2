import Booking from "../models/Booking";
import Payment from "../models/Payment";
import { AppError } from "../middleware/errorHandler";
import { ERROR_CODES } from "../middleware/errorHandler";
import logger from "../config/logger";
import config from "../config/config";

export class RefundService {
  static calculateRefund(
    booking: any,
    cancelledBy: string,
  ): { refundAmount: number; reason: string } {
    const now = new Date();
    const startDate = new Date(booking.bookingDateStart);
    const hoursBeforeStart =
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Owner cancellation - 100% refund
    if (cancelledBy === "owner") {
      return {
        refundAmount: booking.totalPrice,
        reason: "Cancelled by owner",
      };
    }

    // Farmer cancellation
    if (hoursBeforeStart > 48) {
      return {
        refundAmount: booking.totalPrice,
        reason: "Cancelled more than 48 hours before start",
      };
    } else if (hoursBeforeStart > 24) {
      return {
        refundAmount: booking.totalPrice * 0.5,
        reason: "Cancelled 24-48 hours before start",
      };
    } else {
      return {
        refundAmount: 0,
        reason: "Cancelled less than 24 hours before start",
      };
    }
  }

  static async processRefund(
    bookingId: string,
    cancelledBy: string,
  ): Promise<void> {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404, ERROR_CODES.NOT_FOUND);
    }

    const payment = await Payment.findOne({
      booking: bookingId,
      status: "success",
    });
    if (!payment) {
      booking.refundAmount = 0;
      booking.refundStatus = "processed";
      await booking.save();
      return;
    }

    const { refundAmount, reason } = this.calculateRefund(booking, cancelledBy);

    if (refundAmount === 0) {
      booking.refundAmount = 0;
      booking.refundStatus = "processed";
      await booking.save();
      return;
    }

    // Process refund via Razorpay
    try {
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });

      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: refundAmount * 100,
        notes: {
          bookingId: bookingId.toString(),
          reason: reason,
        },
      });

      booking.refundAmount = refundAmount;
      booking.refundStatus = "processed";
      booking.refundId = refund.id;
      await booking.save();

      logger.info(
        `Refund processed for booking ${bookingId}: ₹${refundAmount}`,
      );
    } catch (error: any) {
      booking.refundStatus = "failed";
      await booking.save();
      logger.error("Refund failed:", error.message || error);
      throw new AppError(
        "Refund processing failed",
        500,
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
