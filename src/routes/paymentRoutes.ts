import { Router } from "express";
import { PaymentController } from "../controllers/paymentController";
import {
  createOrderValidator,
  verifyPaymentValidator,
  listPaymentsValidator,
} from "../validators/paymentValidator";
import { authenticate } from "../middleware/auth";

const router = Router();

// Webhook - public
router.post("/webhook", PaymentController.handleWebhook);

// Protected routes
router.use(authenticate);

router.post(
  "/create-order",
  createOrderValidator,
  PaymentController.createOrder,
);
router.post("/verify", verifyPaymentValidator, PaymentController.verifyPayment);
router.get(
  "/history",
  listPaymentsValidator,
  PaymentController.getPaymentHistory,
);
router.get("/order/:orderId", PaymentController.getPaymentByOrderId);
router.get("/booking/:bookingId", PaymentController.getPaymentByBookingId);

export default router;
