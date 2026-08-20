import nodemailer from "nodemailer";
import logger from "../config/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify Your Email - AgroLease",
      html: `
        <h1>Welcome to AgroLease!</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${url}">${url}</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    logger.info(`Verification email sent to ${email}`);
  }

  static async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Reset Your Password - AgroLease",
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${url}">${url}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    logger.info(`Password reset email sent to ${email}`);
  }

  static async sendBookingConfirmationEmail(booking: any): Promise<void> {
    await transporter.sendMail({
      to: booking.renter.email,
      subject: `Booking Confirmed - ${booking.equipment.title}`,
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Your booking for ${booking.equipment.title} has been confirmed.</p>
        <p>Dates: ${booking.bookingDateStart} to ${booking.bookingDateEnd}</p>
        <p>Total: ₹${booking.totalPrice}</p>
      `,
    });

    logger.info(`Booking confirmation email sent to ${booking.renter.email}`);
  }

  static async sendPaymentReceiptEmail(
    payment: any,
    booking: any,
  ): Promise<void> {
    await transporter.sendMail({
      to: payment.user.email,
      subject: "Payment Receipt - AgroLease",
      html: `
        <h1>Payment Receipt</h1>
        <p>Payment of ₹${payment.amount} for ${booking.equipment.title} was successful.</p>
        <p>Transaction ID: ${payment.razorpayPaymentId}</p>
        <p>Date: ${payment.createdAt}</p>
      `,
    });

    logger.info(`Payment receipt email sent to ${payment.user.email}`);
  }
}
