import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded";
  paymentMethod?: string;
  refundAmount?: number;
  refundReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay order ID is required"],
      unique: true,
    },
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: String,
    refundAmount: Number,
    refundReason: String,
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
PaymentSchema.index({ razorpayOrderId: 1 }, { unique: true });
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>("Payment", PaymentSchema);
