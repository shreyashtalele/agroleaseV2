import { Router } from "express";
import { BookingController } from "../controllers/bookingController";
import {
  createBookingValidator,
  listBookingsValidator,
  cancelBookingValidator,
} from "../validators/bookingValidator";
import { authenticate } from "../middleware/auth";

const router = Router();

// All booking routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipmentId
 *               - bookingDateStart
 *               - bookingDateEnd
 *             properties:
 *               equipmentId:
 *                 type: string
 *                 description: Equipment ID
 *               bookingDateStart:
 *                 type: string
 *                 format: date
 *                 description: Start date of booking
 *               bookingDateEnd:
 *                 type: string
 *                 format: date
 *                 description: End date of booking
 *               deliveryType:
 *                 type: string
 *                 enum: [pickup, delivery]
 *                 description: Delivery type
 *               deliveryAddress:
 *                 type: string
 *                 description: Delivery address (required if deliveryType is delivery)
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Equipment already booked
 */
router.post("/", createBookingValidator, BookingController.createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [renter, owner]
 *         description: View bookings as renter or owner
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", listBookingsValidator, BookingController.getMyBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get("/:id", BookingController.getBookingById);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking cannot be cancelled
 */
router.put(
  "/:id/cancel",
  cancelBookingValidator,
  BookingController.cancelBooking,
);

/**
 * @swagger
 * /bookings/{id}/confirm:
 *   put:
 *     summary: Confirm a booking (Owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking confirmed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking cannot be confirmed
 */
router.put("/:id/confirm", BookingController.confirmBooking);

/**
 * @swagger
 * /bookings/{id}/complete:
 *   put:
 *     summary: Complete a booking (Owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking completed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking cannot be completed
 */
router.put("/:id/complete", BookingController.completeBooking);
router.put("/:id/accept", authenticate, BookingController.acceptBooking);
router.put("/:id/reject", authenticate, BookingController.rejectBooking);

router.put("/:id/return", authenticate, BookingController.returnEquipment);
router.put("/:id/inspect", authenticate, BookingController.inspectEquipment);
router.put(
  "/:id/release-deposit",
  authenticate,
  BookingController.releaseDeposit,
);

export default router;
