import Razorpay from "razorpay";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { orders, payments } from "../db/schema/index.js";
import { asyncHandler, NotFoundError, AppError } from "../utils/errors.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create Razorpay payment order
 * @route   POST /api/v1/payments/create
 * @access  Private
 */
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  // Get order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    throw new NotFoundError("Order");
  }

  if (order.userId !== req.user.id) {
    throw new AppError("Unauthorized", 403);
  }

  if (order.status !== "pending") {
    throw new AppError("Order is not in pending status", 400);
  }

  // Check for existing pending payment
  const [existingPayment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (existingPayment && existingPayment.status === "completed") {
    throw new AppError("Payment already completed", 400);
  }

  if (paymentMethod === "cod") {
    // Cash on Delivery
    const [payment] = await db
      .insert(payments)
      .values({
        orderId,
        amount: order.total,
        currency: "INR",
        status: "pending",
        paymentMethod: "cod",
      })
      .returning();

    // Update order status
    await db
      .update(orders)
      .set({ status: "confirmed", updatedAt: new Date().toISOString() })
      .where(eq(orders.id, orderId));

    sendCreated(
      res,
      { payment, order: { ...order, status: "confirmed" } },
      "COD order confirmed",
    );
    return;
  }

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100), // Razorpay expects amount in paise
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderId: order.id,
      userId: req.user.id,
    },
  });

  // Create or update payment record
  let payment;
  if (existingPayment) {
    [payment] = await db
      .update(payments)
      .set({
        razorpayOrderId: razorpayOrder.id,
        status: "processing",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(payments.id, existingPayment.id))
      .returning();
  } else {
    [payment] = await db
      .insert(payments)
      .values({
        orderId,
        amount: order.total,
        currency: "INR",
        status: "processing",
        paymentMethod: "razorpay",
        razorpayOrderId: razorpayOrder.id,
      })
      .returning();
  }

  sendCreated(
    res,
    {
      payment,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    },
    "Payment order created",
  );
});

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // Verify signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new AppError("Invalid payment signature", 400);
  }

  // Get payment
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.razorpayOrderId, razorpayOrderId))
    .limit(1);

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  // Update payment
  await db
    .update(payments)
    .set({
      razorpayPaymentId,
      razorpaySignature,
      status: "completed",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(payments.id, payment.id));

  // Update order status
  await db
    .update(orders)
    .set({ status: "confirmed", updatedAt: new Date().toISOString() })
    .where(eq(orders.id, payment.orderId));

  sendSuccess(res, { verified: true }, "Payment verified successfully");
});

/**
 * @desc    Get payment status
 * @route   GET /api/v1/payments/:orderId
 * @access  Private
 */
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, parseInt(orderId)))
    .limit(1);

  if (!payment) {
    throw new NotFoundError("Payment");
  }

  sendSuccess(res, payment, "Payment status fetched");
});

/**
 * @desc    Razorpay webhook handler
 * @route   POST /api/v1/payments/webhook
 * @access  Public
 */
export const webhookHandler = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new AppError("Invalid webhook signature", 400);
    }
  }

  const { event, payload } = req.body;

  switch (event) {
    case "payment.captured":
      const paymentEntity = payload.payment.entity;

      // Update payment status
      await db
        .update(payments)
        .set({
          razorpayPaymentId: paymentEntity.id,
          status: "completed",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(payments.razorpayOrderId, paymentEntity.order_id));

      // Get payment to find order
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.razorpayOrderId, paymentEntity.order_id))
        .limit(1);

      if (payment) {
        await db
          .update(orders)
          .set({ status: "confirmed", updatedAt: new Date().toISOString() })
          .where(eq(orders.id, payment.orderId));
      }
      break;

    case "payment.failed":
      const failedPayment = payload.payment.entity;

      await db
        .update(payments)
        .set({
          status: "failed",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(payments.razorpayOrderId, failedPayment.order_id));
      break;
  }

  sendSuccess(res, { received: true }, "Webhook processed");
});
