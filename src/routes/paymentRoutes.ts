import { Router } from "express";
import { PaymentController } from "../controllers/paymentController";
import {
  createOrderValidator,
  verifyPaymentValidator,
  listPaymentsValidator,
} from "../validators/paymentValidator";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook handler
 *     tags: [Payments]
 *     description: Webhook endpoint for Razorpay payment events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received
 *       401:
 *         description: Invalid signature
 */
router.post("/webhook", PaymentController.handleWebhook);

// All other payment routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create Razorpay order for booking
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Booking ID to pay for
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         orderId:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                         keyId:
 *                           type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking already paid
 */
router.post(
  "/create-order",
  createOrderValidator,
  PaymentController.createOrder,
);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentId
 *               - signature
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Razorpay order ID
 *               paymentId:
 *                 type: string
 *                 description: Razorpay payment ID
 *               signature:
 *                 type: string
 *                 description: Razorpay signature
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.post("/verify", verifyPaymentValidator, PaymentController.verifyPayment);

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
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
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/history",
  listPaymentsValidator,
  PaymentController.getPaymentHistory,
);

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     summary: Get payment by Razorpay order ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Razorpay order ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get("/order/:orderId", PaymentController.getPaymentByOrderId);

/**
 * @swagger
 * /payments/booking/{bookingId}:
 *   get:
 *     summary: Get payment by booking ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Payment not found
 */
router.get("/booking/:bookingId", PaymentController.getPaymentByBookingId);

export default router;
