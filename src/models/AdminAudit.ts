import mongoose, { Schema, Document } from "mongoose";

export interface IAdminAudit extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetType: "user" | "equipment" | "booking";
  targetId: mongoose.Types.ObjectId;
  changes?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  createdAt: Date;
}

const AdminAuditSchema = new Schema<IAdminAudit>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin ID is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: [
        "user_activate",
        "user_deactivate",
        "user_delete",
        "equipment_verify",
        "equipment_reject",
        "equipment_delete",
        "booking_cancel",
        "booking_modify",
        "report_view",
      ],
    },
    targetType: {
      type: String,
      required: [true, "Target type is required"],
      enum: ["user", "equipment", "booking"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
      refPath: "targetType",
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    reason: {
      type: String,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
AdminAuditSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditSchema.index({ targetType: 1, targetId: 1 });
AdminAuditSchema.index({ createdAt: -1 });

export default mongoose.model<IAdminAudit>("AdminAudit", AdminAuditSchema);
