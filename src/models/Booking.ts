import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  equipment: mongoose.Types.ObjectId;
  renter: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  bookingDateStart: Date;
  bookingDateEnd: Date;
  totalPrice: number;
  securityDeposit: number;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "payment_pending"
    | "confirmed"
    | "active"
    | "completed"
    | "cancelled"
    | "failed";
  acceptedAt?: Date;
  rejectedAt?: Date;
  paymentDeadline?: Date;
  payment: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentDate?: Date;
    status?: "pending" | "completed" | "failed" | "refunded";
  };
  delivery?: {
    type?: "pickup" | "delivery";
    address?: string;
    deliveryDate?: Date;
    returnDate?: Date;
  };
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  durationInDays: number;
}

const BookingSchema = new Schema<IBooking>(
  {
    equipment: {
      type: Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "Equipment is required"],
    },
    renter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Renter is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    bookingDateStart: {
      type: Date,
      required: [true, "Start date is required"],
    },
    bookingDateEnd: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, "Security deposit cannot be negative"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "payment_pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "failed",
      ],
      default: "pending",
    },
    acceptedAt: Date,
    rejectedAt: Date,
    paymentDeadline: Date,
    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paymentDate: Date,
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
    },
    delivery: {
      type: {
        type: String,
        enum: ["pickup", "delivery"],
      },
      address: String,
      deliveryDate: Date,
      returnDate: Date,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    cancellationReason: {
      type: String,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },
    cancelledAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
BookingSchema.index({ renter: 1, status: 1 });
BookingSchema.index({ owner: 1, status: 1 });
BookingSchema.index({ equipment: 1, bookingDateStart: 1, bookingDateEnd: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ "payment.razorpayOrderId": 1 });

// Virtual - duration in days
BookingSchema.virtual("durationInDays").get(function () {
  if (this.bookingDateStart && this.bookingDateEnd) {
    const diff =
      this.bookingDateEnd.getTime() - this.bookingDateStart.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

export default mongoose.model<IBooking>("Booking", BookingSchema);
