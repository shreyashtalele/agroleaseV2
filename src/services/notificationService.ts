import Notification, { INotification } from "../models/Notification";
import mongoose from "mongoose";

interface CreateNotificationData {
  userId: string;
  type: INotification["type"];
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async create(data: CreateNotificationData): Promise<INotification> {
    const notification = new Notification({
      user: new mongoose.Types.ObjectId(data.userId),
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      metadata: data.metadata,
    });

    await notification.save();
    return notification;
  }

  static async getNotifications(
    userId: string,
    options: { page: number; limit: number; unreadOnly?: boolean },
  ): Promise<{ data: INotification[]; total: number; unreadCount: number }> {
    const { page, limit, unreadOnly } = options;
    const skip = (page - 1) * limit;

    const query: any = { user: new mongoose.Types.ObjectId(userId) };
    if (unreadOnly) {
      query.read = false;
    }

    const [data, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, read: false }),
    ]);

    return { data, total, unreadCount };
  }

  static async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<INotification> {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() },
    );
    return result.modifiedCount;
  }

  static async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      user: userId,
    });

    if (result.deletedCount === 0) {
      throw new Error("Notification not found");
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ user: userId, read: false });
  }

  static async notifyBookingCreated(booking: any): Promise<void> {
    const renterId = booking.renter._id || booking.renter;
    const ownerId = booking.owner._id || booking.owner;

    // Always notify renter
    await this.create({
      userId: renterId.toString(),
      type: "booking_created",
      title: "Booking Created",
      message: `Your booking for ${booking.equipment.title} has been created.`,
      actionUrl: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id },
    });

    // Only notify owner if different from renter
    if (renterId.toString() !== ownerId.toString()) {
      await this.create({
        userId: ownerId.toString(),
        type: "booking_created",
        title: "New Booking Request",
        message: `${booking.renter.firstName || "A user"} wants to book your ${booking.equipment.title}`,
        actionUrl: `/bookings/${booking._id}`,
        metadata: { bookingId: booking._id },
      });
    }
  }

  static async notifyBookingAccepted(booking: any): Promise<void> {
    const renterId = booking.renter._id || booking.renter;
    const ownerId = booking.owner._id || booking.owner;

    // Notify renter
    await this.create({
      userId: renterId.toString(),
      type: "booking_accepted",
      title: "Booking Accepted",
      message: `Your booking for ${booking.equipment.title} has been accepted by ${booking.owner.firstName}. Please complete payment within 24 hours.`,
      actionUrl: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id },
    });

    // Notify owner
    await this.create({
      userId: ownerId.toString(),
      type: "booking_accepted",
      title: "Booking Accepted",
      message: `You have accepted the booking for ${booking.equipment.title}.`,
      actionUrl: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id },
    });
  }

  static async notifyBookingRejected(
    booking: any,
    reason?: string,
  ): Promise<void> {
    const renterId = booking.renter._id || booking.renter;

    const message = reason
      ? `Your booking for ${booking.equipment.title} was rejected. Reason: ${reason}`
      : `Your booking for ${booking.equipment.title} was rejected.`;

    await this.create({
      userId: renterId.toString(),
      type: "booking_rejected",
      title: "Booking Rejected",
      message,
      actionUrl: `/equipment/${booking.equipment._id}`,
      metadata: { bookingId: booking._id },
    });
  }

  static async notifyBookingConfirmed(booking: any): Promise<void> {
    const renterId = booking.renter._id || booking.renter;

    await this.create({
      userId: renterId.toString(),
      type: "booking_confirmed",
      title: "Booking Confirmed",
      message: `Your booking for ${booking.equipment.title} has been confirmed.`,
      actionUrl: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id },
    });
  }

  static async notifyBookingCompleted(booking: any): Promise<void> {
    const renterId = booking.renter._id || booking.renter;

    await this.create({
      userId: renterId.toString(),
      type: "booking_completed",
      title: "Booking Completed",
      message: `Your booking for ${booking.equipment.title} has been completed.`,
      actionUrl: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id },
    });
  }

  static async notifyBookingCancelled(
    booking: any,
    cancelledBy: string,
  ): Promise<void> {
    const renterId = booking.renter._id || booking.renter;
    const ownerId = booking.owner._id || booking.owner;

    // Notify renter
    const renterMessage =
      cancelledBy === renterId.toString()
        ? `Your booking for ${booking.equipment.title} has been cancelled by you.`
        : `Your booking for ${booking.equipment.title} has been cancelled by the owner.`;

    await this.create({
      userId: renterId.toString(),
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: renterMessage,
      actionUrl: `/bookings/${booking._id}`,
      metadata: { bookingId: booking._id },
    });

    // Notify owner if different from renter
    if (renterId.toString() !== ownerId.toString()) {
      const ownerMessage =
        cancelledBy === ownerId.toString()
          ? `You cancelled the booking for ${booking.equipment.title}.`
          : `Booking for ${booking.equipment.title} has been cancelled by the renter.`;

      await this.create({
        userId: ownerId.toString(),
        type: "booking_cancelled",
        title: "Booking Cancelled",
        message: ownerMessage,
        actionUrl: `/bookings/${booking._id}`,
        metadata: { bookingId: booking._id },
      });
    }
  }

  static async notifyPaymentSuccess(payment: any, booking: any): Promise<void> {
    const userId = payment.user._id || payment.user;

    await this.create({
      userId: userId.toString(),
      type: "payment_success",
      title: "Payment Successful",
      message: `Payment of ₹${payment.amount} for ${booking.equipment.title} was successful.`,
      actionUrl: `/payments/${payment._id}`,
      metadata: { paymentId: payment._id, bookingId: booking._id },
    });
  }

  static async notifyPaymentFailed(payment: any, booking: any): Promise<void> {
    const userId = payment.user._id || payment.user;

    await this.create({
      userId: userId.toString(),
      type: "payment_failed",
      title: "Payment Failed",
      message: `Payment of ₹${payment.amount} for ${booking.equipment.title} failed. Please try again.`,
      actionUrl: `/bookings/${booking._id}/pay`,
      metadata: { paymentId: payment._id, bookingId: booking._id },
    });
  }

  static async notifyEquipmentVerified(
    equipment: any,
    ownerId: string,
  ): Promise<void> {
    await this.create({
      userId: ownerId,
      type: "equipment_verified",
      title: "Equipment Verified",
      message: `Your ${equipment.title} has been verified by admin.`,
      actionUrl: `/equipment/${equipment._id}`,
      metadata: { equipmentId: equipment._id },
    });
  }

  static async notifyEquipmentRejected(
    equipment: any,
    ownerId: string,
    reason?: string,
  ): Promise<void> {
    const message = reason
      ? `Your ${equipment.title} was rejected. Reason: ${reason}`
      : `Your ${equipment.title} was rejected by admin.`;

    await this.create({
      userId: ownerId,
      type: "equipment_rejected",
      title: "Equipment Rejected",
      message,
      actionUrl: `/equipment/${equipment._id}`,
      metadata: { equipmentId: equipment._id },
    });
  }
}
