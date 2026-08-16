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

router.post("/", createBookingValidator, BookingController.createBooking);
router.get("/", listBookingsValidator, BookingController.getMyBookings);
router.get("/:id", BookingController.getBookingById);
router.put(
  "/:id/cancel",
  cancelBookingValidator,
  BookingController.cancelBooking,
);
router.put("/:id/confirm", BookingController.confirmBooking);
router.put("/:id/complete", BookingController.completeBooking);

export default router;
