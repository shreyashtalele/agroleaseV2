import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type:
    | "booking_created"
    | "booking_accepted"
    | "booking_rejected"
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_completed"
    | "payment_success"
    | "payment_failed"
    | "equipment_verified"
    | "equipment_rejected"
    | "system";
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_accepted",
        "booking_rejected",
        "booking_confirmed",
        "booking_cancelled",
        "booking_completed",
        "payment_success",
        "payment_failed",
        "equipment_verified",
        "equipment_rejected",
        "system",
      ],
      required: [true, "Type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    actionUrl: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
