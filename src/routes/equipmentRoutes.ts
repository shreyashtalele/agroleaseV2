import { Router } from "express";
import { EquipmentController } from "../controllers/equipmentController";
import {
  createEquipmentValidator,
  updateEquipmentValidator,
  listEquipmentValidator,
} from "../validators/equipmentValidator";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", listEquipmentValidator, EquipmentController.getEquipmentList);
router.get("/categories", EquipmentController.getCategories);
router.get("/:id", EquipmentController.getEquipmentById);
router.get("/:id/availability", EquipmentController.checkAvailability);

// Protected routes
router.post(
  "/",
  authenticate,
  createEquipmentValidator,
  EquipmentController.createEquipment,
);
router.put(
  "/:id",
  authenticate,
  updateEquipmentValidator,
  EquipmentController.updateEquipment,
);
router.delete("/:id", authenticate, EquipmentController.deleteEquipment);
router.get("/my/listings", authenticate, EquipmentController.getMyListings);

export default router;
