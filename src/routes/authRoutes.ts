import { Router } from "express";
import { AuthController } from "../controllers/authController";
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  changePasswordValidator,
  updateProfileValidator,
} from "../validators/authValidator";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", registerValidator, AuthController.register);
router.post("/login", loginValidator, AuthController.login);
router.post(
  "/refresh-token",
  refreshTokenValidator,
  AuthController.refreshToken,
);

// Protected routes
router.get("/me", authenticate, AuthController.getProfile);
router.put(
  "/me",
  authenticate,
  updateProfileValidator,
  AuthController.updateProfile,
);
router.put(
  "/change-password",
  authenticate,
  changePasswordValidator,
  AuthController.changePassword,
);
router.post("/logout", authenticate, AuthController.logout);

export default router;
