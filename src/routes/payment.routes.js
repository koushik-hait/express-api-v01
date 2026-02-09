import express from "express";
import {
  createPayment,
  verifyPayment,
  getPaymentStatus,
  webhookHandler,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  createPaymentSchema,
  verifyPaymentSchema,
  idParamSchema,
} from "../validators/order.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/payments/webhook:
 *   post:
 *     summary: Razorpay webhook handler
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook", webhookHandler);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/payments/create:
 *   post:
 *     summary: Create payment order
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
 *             properties:
 *               orderId:
 *                 type: integer
 *               paymentMethod:
 *                 type: string
 *                 enum: [razorpay, cod]
 *                 default: razorpay
 *     responses:
 *       201:
 *         description: Payment order created
 */
router.post("/create", validateBody(createPaymentSchema), createPayment);

/**
 * @swagger
 * /api/v1/payments/verify:
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
 *               - razorpayOrderId
 *               - razorpayPaymentId
 *               - razorpaySignature
 *             properties:
 *               razorpayOrderId:
 *                 type: string
 *               razorpayPaymentId:
 *                 type: string
 *               razorpaySignature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post("/verify", validateBody(verifyPaymentSchema), verifyPayment);

/**
 * @swagger
 * /api/v1/payments/{orderId}:
 *   get:
 *     summary: Get payment status for order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment status
 */
router.get("/:orderId", getPaymentStatus);

export default router;
