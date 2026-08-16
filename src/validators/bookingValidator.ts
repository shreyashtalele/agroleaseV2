import { body, query } from "express-validator";

export const createBookingValidator = [
  body("equipmentId")
    .notEmpty()
    .withMessage("Equipment ID is required")
    .isMongoId()
    .withMessage("Invalid equipment ID"),

  body("bookingDateStart")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format")
    .custom((value) => {
      const date = new Date(value);
      if (date < new Date()) {
        throw new Error("Start date cannot be in the past");
      }
      return true;
    }),

  body("bookingDateEnd")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((value, { req }) => {
      const start = new Date(req.body.bookingDateStart);
      const end = new Date(value);
      if (end <= start) {
        throw new Error("End date must be after start date");
      }
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays > 30) {
        throw new Error("Booking duration cannot exceed 30 days");
      }
      return true;
    }),

  body("deliveryType")
    .optional()
    .isIn(["pickup", "delivery"])
    .withMessage("Delivery type must be pickup or delivery"),

  body("deliveryAddress")
    .optional()
    .isString()
    .withMessage("Delivery address must be a string")
    .isLength({ min: 5 })
    .withMessage("Delivery address must be at least 5 characters"),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

export const listBookingsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn([
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
      "failed",
    ])
    .withMessage("Invalid status"),

  query("type")
    .optional()
    .isIn(["renter", "owner"])
    .withMessage("Type must be renter or owner"),
];

export const cancelBookingValidator = [
  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];
