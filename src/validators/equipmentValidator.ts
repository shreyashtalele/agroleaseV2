import { body, query } from "express-validator";

export const createEquipmentValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "tractor",
      "harvester",
      "plow",
      "cultivator",
      "seeder",
      "sprayer",
      "irrigation",
      "baler",
      "combine",
      "mower",
      "other",
    ])
    .withMessage("Invalid category"),

  body("rentalPricePerDay")
    .notEmpty()
    .withMessage("Rental price is required")
    .isFloat({ min: 0 })
    .withMessage("Rental price must be a positive number"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("securityDeposit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Security deposit must be a positive number"),

  body("quantity")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),

  body("location.city").notEmpty().withMessage("City is required"),

  body("location.state").notEmpty().withMessage("State is required"),

  body("location.pincode")
    .optional()
    .isLength({ min: 5, max: 6 })
    .withMessage("Pincode must be 5-6 characters"),

  body("specifications.brand")
    .optional()
    .isString()
    .withMessage("Brand must be a string"),

  body("specifications.model")
    .optional()
    .isString()
    .withMessage("Model must be a string"),

  body("specifications.modelYear")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(
      `Model year must be between 1900 and ${new Date().getFullYear()}`,
    ),

  body("specifications.powerSource")
    .optional()
    .isIn(["diesel", "electric", "manual", "solar", "petrol"])
    .withMessage("Invalid power source"),

  body("availableFrom")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  body("availableUntil")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value, { req }) => {
      if (req.body.availableFrom && value < req.body.availableFrom) {
        throw new Error("Available until must be after available from");
      }
      return true;
    }),
];

export const updateEquipmentValidator = [
  body("title")
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),

  body("description")
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("category")
    .optional()
    .isIn([
      "tractor",
      "harvester",
      "plow",
      "cultivator",
      "seeder",
      "sprayer",
      "irrigation",
      "baler",
      "combine",
      "mower",
      "other",
    ])
    .withMessage("Invalid category"),

  body("rentalPricePerDay")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Rental price must be a positive number"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("securityDeposit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Security deposit must be a positive number"),

  body("quantity")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),

  body("status")
    .optional()
    .isIn(["available", "rented", "under_maintenance", "sold"])
    .withMessage("Invalid status"),

  body("location.city")
    .optional()
    .notEmpty()
    .withMessage("City cannot be empty"),

  body("location.state")
    .optional()
    .notEmpty()
    .withMessage("State cannot be empty"),

  body("location.pincode")
    .optional()
    .isLength({ min: 5, max: 6 })
    .withMessage("Pincode must be 5-6 characters"),
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

  query("category")
    .optional()
    .isIn([
      "tractor",
      "harvester",
      "plow",
      "cultivator",
      "seeder",
      "sprayer",
      "irrigation",
      "baler",
      "combine",
      "mower",
      "other",
    ])
    .withMessage("Invalid category"),

  query("city").optional().isString().withMessage("City must be a string"),

  query("state").optional().isString().withMessage("State must be a string"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price must be a positive number"),

  query("status")
    .optional()
    .isIn(["available", "rented", "under_maintenance", "sold"])
    .withMessage("Invalid status"),

  query("search").optional().isString().withMessage("Search must be a string"),

  query("sort")
    .optional()
    .isIn([
      "createdAt",
      "rentalPricePerDay",
      "-createdAt",
      "-rentalPricePerDay",
    ])
    .withMessage("Invalid sort field"),
];
