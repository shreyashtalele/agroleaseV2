import { query, body, param } from "express-validator";

export const listUsersValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("role")
    .optional()
    .isIn(["farmer", "provider", "admin"])
    .withMessage("Role must be farmer, provider, or admin"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const updateUserStatusValidator = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("isActive").isBoolean().withMessage("isActive must be a boolean"),
  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

export const listEquipmentValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("status")
    .optional()
    .isIn(["available", "rented", "under_maintenance", "sold"])
    .withMessage("Invalid status"),
  query("isVerified")
    .optional()
    .isBoolean()
    .withMessage("isVerified must be a boolean"),
];

export const verifyEquipmentValidator = [
  param("id").isMongoId().withMessage("Invalid equipment ID"),
  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

export const rejectEquipmentValidator = [
  param("id").isMongoId().withMessage("Invalid equipment ID"),
  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

export const listAuditLogsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("adminId").optional().isMongoId().withMessage("Invalid admin ID"),
  query("targetType")
    .optional()
    .isIn(["user", "equipment", "booking"])
    .withMessage("Target type must be user, equipment, or booking"),
  query("action")
    .optional()
    .isIn([
      "user_activate",
      "user_deactivate",
      "user_delete",
      "equipment_verify",
      "equipment_reject",
      "equipment_delete",
      "booking_cancel",
      "booking_modify",
      "report_view",
    ])
    .withMessage("Invalid action"),
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
  query("search").optional().isString().withMessage("Search must be a string"),
];
