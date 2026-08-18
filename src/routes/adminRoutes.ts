import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import {
  listUsersValidator,
  updateUserStatusValidator,
  listEquipmentValidator,
  verifyEquipmentValidator,
  rejectEquipmentValidator,
  listAuditLogsValidator,
  listBookingsValidator,
} from "../validators/adminValidator";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/dashboard/stats", AdminController.getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [farmer, provider, admin]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/users", listUsersValidator, AdminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     summary: Activate or deactivate a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Set to true to activate, false to deactivate
 *               reason:
 *                 type: string
 *                 description: Reason for status change
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put(
  "/users/:id/status",
  updateUserStatusValidator,
  AdminController.updateUserStatus,
);

/**
 * @swagger
 * /admin/equipment:
 *   get:
 *     summary: List all equipment
 *     tags: [Admin]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or brand
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, rented, under_maintenance, sold]
 *         description: Filter by status
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: Equipment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  "/equipment",
  listEquipmentValidator,
  AdminController.getEquipmentList,
);

/**
 * @swagger
 * /admin/equipment/{id}/verify:
 *   put:
 *     summary: Verify equipment
 *     tags: [Admin]
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
 *               reason:
 *                 type: string
 *                 description: Reason for verification
 *     responses:
 *       200:
 *         description: Equipment verified successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Equipment not found
 */
router.put(
  "/equipment/:id/verify",
  verifyEquipmentValidator,
  AdminController.verifyEquipment,
);

/**
 * @swagger
 * /admin/equipment/{id}/reject:
 *   put:
 *     summary: Reject equipment
 *     tags: [Admin]
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
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Equipment rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Equipment not found
 */
router.put(
  "/equipment/:id/reject",
  rejectEquipmentValidator,
  AdminController.rejectEquipment,
);

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: List all bookings
 *     tags: [Admin]
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
 *           enum: [pending, confirmed, active, completed, cancelled, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/bookings", listBookingsValidator, AdminController.getBookings);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get admin audit logs
 *     tags: [Admin]
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
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filter by admin ID
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [user, equipment, booking]
 *         description: Filter by target type
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [user_activate, user_deactivate, user_delete, equipment_verify, equipment_reject, equipment_delete, booking_cancel, booking_modify, report_view]
 *         description: Filter by action
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/audit-logs", listAuditLogsValidator, AdminController.getAuditLogs);

export default router;
