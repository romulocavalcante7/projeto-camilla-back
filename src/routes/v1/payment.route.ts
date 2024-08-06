import express from "express";
import { paymentController } from "../../controllers";

const router = express.Router();

router.route("/user/:userId/payment-status").get(paymentController.getUserPaymentStatus);

export default router;
