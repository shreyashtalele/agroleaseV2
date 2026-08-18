import User from "../models/User";
import Equipment from "../models/Equipment";
import Booking from "../models/Booking";
import Payment from "../models/Payment";
import AdminAudit, { IAdminAudit } from "../models/AdminAudit";
import { AppError } from "../middleware/errorHandler";
import { ERROR_CODES } from "../middleware/errorHandler";
import mongoose from "mongoose";
import { NotificationService } from "./notificationService";

interface AuditData {
  adminId: string;
  action: string;
  targetType: "user" | "equipment" | "booking";
  targetId: string;
  changes?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
}

export class AdminService {
  static async logAudit(data: AuditData): Promise<IAdminAudit> {
    const audit = new AdminAudit({
      adminId: new mongoose.Types.ObjectId(data.adminId),
      action: data.action,
      targetType: data.targetType,
      targetId: new mongoose.Types.ObjectId(data.targetId),
      changes: data.changes,
      reason: data.reason,
      ipAddress: data.ipAddress,
    });

    await audit.save();
    return audit;
  }

  static async getDashboardStats(): Promise<{
    users: {
      total: number;
      active: number;
      providers: number;
      farmers: number;
    };
    equipment: {
      total: number;
      available: number;
      rented: number;
      pendingVerification: number;
    };
    bookings: {
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
    };
    revenue: { total: number; thisMonth: number };
  }> {
    const [
      totalUsers,
      activeUsers,
      providers,
      farmers,
      totalEquipment,
      availableEquipment,
      rentedEquipment,
      pendingVerification,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "provider" }),
      User.countDocuments({ role: "farmer" }),
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: "available" }),
      Equipment.countDocuments({ status: "rented" }),
      Equipment.countDocuments({ isVerified: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: "success",
            createdAt: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              ),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        providers,
        farmers,
      },
      equipment: {
        total: totalEquipment,
        available: availableEquipment,
        rented: rentedEquipment,
        pendingVerification,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthlyRevenue[0]?.total || 0,
      },
    };
  }

  static async getUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    const { page, limit, search, role, isActive } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      User.find(query)
        .select("-password -verificationToken -resetPasswordToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { data, total };
  }

  static async updateUserStatus(
    userId: string,
    isActive: boolean,
    adminId: string,
    reason?: string,
  ): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
    }

    user.isActive = isActive;
    await user.save();

    await this.logAudit({
      adminId,
      action: isActive ? "user_activate" : "user_deactivate",
      targetType: "user",
      targetId: userId,
      changes: { isActive },
      reason,
    });

    return user;
  }

  static async getEquipmentList(options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    isVerified?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    const { page, limit, search, status, isVerified } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;
    if (isVerified !== undefined) query.isVerified = isVerified;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "specifications.brand": { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      Equipment.find(query)
        .populate("owner", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Equipment.countDocuments(query),
    ]);

    return { data, total };
  }

  static async verifyEquipment(
    equipmentId: string,
    adminId: string,
    reason?: string,
  ): Promise<any> {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      throw new AppError("Equipment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    equipment.isVerified = true;
    await equipment.save();

    await this.logAudit({
      adminId,
      action: "equipment_verify",
      targetType: "equipment",
      targetId: equipmentId,
      reason,
    });

    // Notify owner
    await NotificationService.notifyEquipmentVerified(
      equipment,
      equipment.owner.toString(),
    );

    return equipment;
  }

  static async rejectEquipment(
    equipmentId: string,
    adminId: string,
    reason?: string,
  ): Promise<any> {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      throw new AppError("Equipment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    equipment.isVerified = false;
    equipment.status = "under_maintenance";
    await equipment.save();

    await this.logAudit({
      adminId,
      action: "equipment_reject",
      targetType: "equipment",
      targetId: equipmentId,
      reason,
    });

    // Notify owner
    await NotificationService.notifyEquipmentRejected(
      equipment,
      equipment.owner.toString(),
      reason,
    );

    return equipment;
  }

  static async getAuditLogs(options: {
    page: number;
    limit: number;
    adminId?: string;
    targetType?: string;
    action?: string;
  }): Promise<{ data: IAdminAudit[]; total: number }> {
    const { page, limit, adminId, targetType, action } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (adminId) query.adminId = new mongoose.Types.ObjectId(adminId);
    if (targetType) query.targetType = targetType;
    if (action) query.action = action;

    const [data, total] = await Promise.all([
      AdminAudit.find(query)
        .populate("adminId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AdminAudit.countDocuments(query),
    ]);

    return { data, total };
  }

  static async getBookings(options: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }): Promise<{ data: any[]; total: number }> {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      Booking.find(query)
        .populate("equipment", "title category")
        .populate("renter", "firstName lastName email")
        .populate("owner", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return { data, total };
  }
}
