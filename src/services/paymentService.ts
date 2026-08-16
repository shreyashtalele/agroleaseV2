import Razorpay from "razorpay";
import crypto from "crypto";
import Payment, { IPayment } from "../models/Payment";
import Booking from "../models/Booking";
import { AppError } from "../middleware/errorHandler";
import { ERROR_CODES } from "../middleware/errorHandler";
import config from "../config/config";

interface CreateOrderData {
  bookingId: string;
  userId: string;
}

interface VerifyPaymentData {
  orderId: string;
  paymentId: string;
  signature: string;
}

export class PaymentService {
  private static razorpay: Razorpay;

  static initialize() {
    if (!this.razorpay) {
      this.razorpay = new Razorpay({
        key_id: config.razorpay.keyId || "",
        key_secret: config.razorpay.keySecret || "",
      });
    }
    return this.razorpay;
  }

  static async createOrder(
    data: CreateOrderData,
  ): Promise<{ order: any; payment: IPayment }> {
    const { bookingId, userId } = data;

    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // Check if user is the renter
    if (booking.renter.toString() !== userId) {
      throw new AppError(
        "You are not authorized to pay for this booking",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    // Check if booking is already paid
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: "success",
    });
    if (existingPayment) {
      throw new AppError("Booking already paid", 400, ERROR_CODES.CONFLICT);
    }

    // Initialize Razorpay
    const razorpay = this.initialize();

    // Create order
    const options = {
      amount: booking.totalPrice * 100, // Amount in paise
      currency: "INR",
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: userId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      booking: bookingId,
      user: userId,
      razorpayOrderId: order.id,
      amount: booking.totalPrice,
      currency: "INR",
      status: "pending",
      metadata: {
        bookingDateStart: booking.bookingDateStart,
        bookingDateEnd: booking.bookingDateEnd,
      },
    });

    await payment.save();

    return { order, payment };
  }

  static async verifyPayment(data: VerifyPaymentData): Promise<IPayment> {
    const { orderId, paymentId, signature } = data;

    // Generate signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new AppError(
        "Invalid payment signature",
        400,
        ERROR_CODES.PAYMENT_FAILED,
      );
    }

    // Find payment
    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      throw new AppError("Payment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // Update payment
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = "success";
    payment.paymentMethod = "razorpay";
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = "confirmed";
      booking.payment = {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paymentDate: new Date(),
        status: "completed",
      };
      await booking.save();
    }

    return payment;
  }

  static async handleWebhook(body: any, signature: string): Promise<void> {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret || "")
      .update(JSON.stringify(body))
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new AppError(
        "Invalid webhook signature",
        401,
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    const event = body.event;
    const payload = body.payload;

    if (event === "payment.captured") {
      const orderId = payload.payment.entity.order_id;
      const paymentId = payload.payment.entity.id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status === "pending") {
        payment.razorpayPaymentId = paymentId;
        payment.status = "success";
        await payment.save();

        // Update booking
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.status = "confirmed";
          booking.payment = {
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            paymentDate: new Date(),
            status: "completed",
          };
          await booking.save();
        }
      }
    }

    if (event === "payment.failed") {
      const orderId = payload.payment.entity.order_id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
    }
  }

  static async getPaymentHistory(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<{ data: IPayment[]; total: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Payment.find({ user: userId })
        .populate(
          "booking",
          "bookingDateStart bookingDateEnd totalPrice status",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ user: userId }),
    ]);

    return { data, total };
  }

  static async getPaymentByOrderId(orderId: string): Promise<IPayment> {
    const payment = await Payment.findOne({ razorpayOrderId: orderId })
      .populate("booking")
      .populate("user", "firstName lastName email");

    if (!payment) {
      throw new AppError("Payment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    return payment;
  }

  static async getPaymentByBookingId(
    bookingId: string,
    userId: string,
  ): Promise<IPayment> {
    const payment = await Payment.findOne({ booking: bookingId })
      .populate("booking")
      .populate("user", "firstName lastName email");

    if (!payment) {
      throw new AppError("Payment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    if (payment.user.toString() !== userId) {
      throw new AppError(
        "You are not authorized to view this payment",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    return payment;
  }
}
