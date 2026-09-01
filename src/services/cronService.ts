import cron from "node-cron";
import Booking from "../models/Booking";
import logger from "../config/logger";
import { NotificationService } from "./notificationService";

export class CronService {
  static start() {
    // Run every hour
    cron.schedule("0 * * * *", async () => {
      await this.expirePendingBookings();
    });
  }

  static async expirePendingBookings() {
    try {
      const expiredBookings = await Booking.find({
        status: "pending",
        expiresAt: { $lt: new Date() },
      });

      for (const booking of expiredBookings) {
        booking.status = "cancelled";
        booking.cancellationReason =
          "Auto-cancelled: Owner did not respond within 24 hours";
        booking.cancelledAt = new Date();
        await booking.save();

        await booking.populate([
          { path: "equipment", select: "title" },
          { path: "renter", select: "firstName lastName" },
          { path: "owner", select: "firstName lastName" },
        ]);

        await NotificationService.notifyBookingCancelled(booking, "system");
        logger.info(`Booking ${booking._id} auto-cancelled (expired)`);
      }
    } catch (error: any) {
      logger.error("Error expiring pending bookings:", error);
    }
  }
}
