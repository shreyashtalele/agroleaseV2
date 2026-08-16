import { body, query } from "express-validator";

export const createOrderValidator = [
  body("bookingId")
    .notEmpty()
    .withMessage("Booking ID is required")
    .isMongoId()
    .withMessage("Invalid booking ID"),
];

export const verifyPaymentValidator = [
  body("orderId").notEmpty().withMessage("Order ID is required"),

  body("paymentId").notEmpty().withMessage("Payment ID is required"),

  body("signature").notEmpty().withMessage("Signature is required"),
];

export const listPaymentsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
