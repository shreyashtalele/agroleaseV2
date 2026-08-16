import Booking, { IBooking } from "../models/Booking";
import Equipment from "../models/Equipment";
import { AppError } from "../middleware/errorHandler";
import { ERROR_CODES } from "../middleware/errorHandler";
import mongoose from "mongoose";

interface CreateBookingData {
  equipmentId: string;
  bookingDateStart: Date;
  bookingDateEnd: Date;
  deliveryType?: "pickup" | "delivery";
  deliveryAddress?: string;
  notes?: string;
}

interface ListOptions {
  page: number;
  limit: number;
  status?: string;
  type?: "renter" | "owner";
  userId: string;
}

export class BookingService {
  static async createBooking(
    data: CreateBookingData,
    renterId: string,
  ): Promise<IBooking> {
    // Get equipment
    const equipment = await Equipment.findById(data.equipmentId);
    if (!equipment) {
      throw new AppError("Equipment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // Check availability
    if (equipment.status !== "available") {
      throw new AppError(
        "Equipment is not available",
        400,
        ERROR_CODES.EQUIPMENT_UNAVAILABLE,
      );
    }

    if (equipment.quantity <= 0) {
      throw new AppError(
        "Equipment is out of stock",
        400,
        ERROR_CODES.EQUIPMENT_UNAVAILABLE,
      );
    }

    // Check date availability
    const start = new Date(data.bookingDateStart);
    const end = new Date(data.bookingDateEnd);

    if (equipment.availableFrom && start < new Date(equipment.availableFrom)) {
      throw new AppError(
        `Equipment is not available before ${equipment.availableFrom}`,
        400,
        ERROR_CODES.EQUIPMENT_UNAVAILABLE,
      );
    }

    if (equipment.availableUntil && end > new Date(equipment.availableUntil)) {
      throw new AppError(
        `Equipment is not available after ${equipment.availableUntil}`,
        400,
        ERROR_CODES.EQUIPMENT_UNAVAILABLE,
      );
    }

    // Check overlapping bookings
    const overlapping = await Booking.findOne({
      equipment: equipment._id,
      status: { $in: ["pending", "confirmed", "active"] },
      $or: [
        {
          bookingDateStart: { $lte: end },
          bookingDateEnd: { $gte: start },
        },
      ],
    });

    if (overlapping) {
      throw new AppError(
        "Equipment is already booked for selected dates",
        409,
        ERROR_CODES.BOOKING_CONFLICT,
      );
    }

    // Calculate total price
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = diffDays * equipment.rentalPricePerDay;
    const securityDeposit = equipment.securityDeposit || 0;

    // Create booking
    const booking = new Booking({
      equipment: equipment._id,
      renter: new mongoose.Types.ObjectId(renterId),
      owner: equipment.owner,
      bookingDateStart: start,
      bookingDateEnd: end,
      totalPrice,
      securityDeposit,
      status: "pending",
      delivery: data.deliveryType
        ? {
            type: data.deliveryType,
            address: data.deliveryAddress,
          }
        : undefined,
      notes: data.notes,
    });

    await booking.save();

    // Populate equipment and user details
    await booking.populate([
      {
        path: "equipment",
        select: "title category rentalPricePerDay location images",
      },
      { path: "renter", select: "firstName lastName email phoneNumber" },
      { path: "owner", select: "firstName lastName email phoneNumber" },
    ]);

    return booking;
  }

  static async getBookings(
    options: ListOptions,
  ): Promise<{ data: IBooking[]; total: number }> {
    const { page, limit, status, type, userId } = options;

    const query: any = {};

    if (status) query.status = status;
    if (type === "renter") query.renter = new mongoose.Types.ObjectId(userId);
    if (type === "owner") query.owner = new mongoose.Types.ObjectId(userId);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Booking.find(query)
        .populate(
          "equipment",
          "title category rentalPricePerDay location images",
        )
        .populate("renter", "firstName lastName email phoneNumber")
        .populate("owner", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    return { data, total };
  }

  static async getBookingById(id: string, userId: string): Promise<IBooking> {
    const booking = await Booking.findById(id)
      .populate(
        "equipment",
        "title category rentalPricePerDay location images owner",
      )
      .populate("renter", "firstName lastName email phoneNumber")
      .populate("owner", "firstName lastName email phoneNumber");

    if (!booking) {
      throw new AppError("Booking not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // Check if user is renter or owner
    if (
      booking.renter._id.toString() !== userId &&
      booking.owner._id.toString() !== userId
    ) {
      throw new AppError(
        "You are not authorized to view this booking",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    return booking;
  }

  static async cancelBooking(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<IBooking> {
    const booking = await Booking.findById(id);

    if (!booking) {
      throw new AppError("Booking not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // Check if user is renter or owner
    if (
      booking.renter.toString() !== userId &&
      booking.owner.toString() !== userId
    ) {
      throw new AppError(
        "You are not authorized to cancel this booking",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    // Check if booking can be cancelled
    if (["completed", "cancelled", "failed"].includes(booking.status)) {
      throw new AppError(
        `Booking cannot be cancelled (status: ${booking.status})`,
        400,
        ERROR_CODES.BOOKING_CONFLICT,
      );
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "Cancelled by user";
    booking.cancelledAt = new Date();

    await booking.save();

    // Return equipment quantity
    await Equipment.findByIdAndUpdate(booking.equipment, {
      $inc: { quantity: 1 },
    });

    return booking;
  }

  static async confirmBooking(id: string, ownerId: string): Promise<IBooking> {
    const booking = await Booking.findById(id);

    if (!booking) {
      throw new AppError("Booking not found", 404, ERROR_CODES.NOT_FOUND);
    }

    if (booking.owner.toString() !== ownerId) {
      throw new AppError(
        "You are not authorized to confirm this booking",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    if (booking.status !== "pending") {
      throw new AppError(
        `Booking cannot be confirmed (status: ${booking.status})`,
        400,
        ERROR_CODES.BOOKING_CONFLICT,
      );
    }

    booking.status = "confirmed";
    await booking.save();

    // Decrease equipment quantity
    await Equipment.findByIdAndUpdate(booking.equipment, {
      $inc: { quantity: -1 },
    });

    return booking;
  }

  static async completeBooking(id: string, ownerId: string): Promise<IBooking> {
    const booking = await Booking.findById(id);

    if (!booking) {
      throw new AppError("Booking not found", 404, ERROR_CODES.NOT_FOUND);
    }

    if (booking.owner.toString() !== ownerId) {
      throw new AppError(
        "You are not authorized to complete this booking",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    if (booking.status !== "active") {
      throw new AppError(
        `Booking cannot be completed (status: ${booking.status})`,
        400,
        ERROR_CODES.BOOKING_CONFLICT,
      );
    }

    booking.status = "completed";
    booking.completedAt = new Date();

    await booking.save();

    return booking;
  }

  static async getRenterBookings(
    userId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<{ data: IBooking[]; total: number }> {
    return this.getBookings({
      ...options,
      type: "renter",
      userId,
    });
  }

  static async getOwnerBookings(
    userId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<{ data: IBooking[]; total: number }> {
    return this.getBookings({
      ...options,
      type: "owner",
      userId,
    });
  }
}
