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

// Dashboard
router.get("/dashboard/stats", AdminController.getDashboardStats);

// User Management
router.get("/users", listUsersValidator, AdminController.getUsers);
router.put(
  "/users/:id/status",
  updateUserStatusValidator,
  AdminController.updateUserStatus,
);

// Equipment Management
router.get(
  "/equipment",
  listEquipmentValidator,
  AdminController.getEquipmentList,
);
router.put(
  "/equipment/:id/verify",
  verifyEquipmentValidator,
  AdminController.verifyEquipment,
);
router.put(
  "/equipment/:id/reject",
  rejectEquipmentValidator,
  AdminController.rejectEquipment,
);

// Booking Management
router.get("/bookings", listBookingsValidator, AdminController.getBookings);

// Audit Logs
router.get("/audit-logs", listAuditLogsValidator, AdminController.getAuditLogs);

export default router;
