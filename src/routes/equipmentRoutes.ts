import { Router } from "express";
import { EquipmentController } from "../controllers/equipmentController";
import { uploadMultiple } from "../middleware/upload";
import {
  createEquipmentValidator,
  updateEquipmentValidator,
  listEquipmentValidator,
} from "../validators/equipmentValidator";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Get list of equipment with filters
 *     tags: [Equipment]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [tractor, harvester, plow, cultivator, seeder, sprayer, irrigation, baler, combine, mower, other]
 *         description: Filter by category
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by keyword
 *     responses:
 *       200:
 *         description: Equipment list retrieved successfully
 */
router.get("/", listEquipmentValidator, EquipmentController.getEquipmentList);

/**
 * @swagger
 * /equipment/categories:
 *   get:
 *     summary: Get all equipment categories
 *     tags: [Equipment]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/categories", EquipmentController.getCategories);

/**
 * @swagger
 * /equipment/{id}:
 *   get:
 *     summary: Get equipment by ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment retrieved successfully
 *       404:
 *         description: Equipment not found
 */
router.get("/:id", EquipmentController.getEquipmentById);

/**
 * @swagger
 * /equipment/{id}/availability:
 *   get:
 *     summary: Check equipment availability
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Availability status retrieved
 */
router.get("/:id/availability", EquipmentController.checkAvailability);

/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Create new equipment listing
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - rentalPricePerDay
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [tractor, harvester, plow, cultivator, seeder, sprayer, irrigation, baler, combine, mower, other]
 *               rentalPricePerDay:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *               quantity:
 *                 type: number
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *               specifications:
 *                 type: object
 *                 properties:
 *                   brand:
 *                     type: string
 *                   model:
 *                     type: string
 *                   modelYear:
 *                     type: number
 *                   powerSource:
 *                     type: string
 *                     enum: [diesel, electric, manual, solar, petrol]
 *                   horsepower:
 *                     type: number
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  uploadMultiple,
  createEquipmentValidator,
  EquipmentController.createEquipment,
);

/**
 * @swagger
 * /equipment/{id}:
 *   put:
 *     summary: Update equipment listing
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               rentalPricePerDay:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *               quantity:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, rented, under_maintenance, sold]
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Equipment not found
 */
router.put(
  "/:id",
  authenticate,
  updateEquipmentValidator,
  EquipmentController.updateEquipment,
);

/**
 * @swagger
 * /equipment/{id}:
 *   delete:
 *     summary: Delete equipment listing
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Equipment not found
 */
router.delete("/:id", authenticate, EquipmentController.deleteEquipment);

/**
 * @swagger
 * /equipment/my/listings:
 *   get:
 *     summary: Get current user's equipment listings
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, rented, under_maintenance, sold]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my/listings", authenticate, EquipmentController.getMyListings);

export default router;
