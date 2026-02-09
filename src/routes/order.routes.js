import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  idParamSchema,
  orderQuerySchema,
} from "../validators/order.validator.js";

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/", validate({ query: orderQuerySchema }), getOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order with items
 */
router.get("/:id", validateParams(idParamSchema), getOrder);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddressId
 *             properties:
 *               shippingAddressId:
 *                 type: integer
 *               billingAddressId:
 *                 type: integer
 *               notes:
 *                 type: string
 *               couponCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 */
router.post("/", validateBody(createOrderSchema), createOrder);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put(
  "/:id/status",
  authorize("admin"),
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  updateOrderStatus,
);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post("/:id/cancel", validateParams(idParamSchema), cancelOrder);

export default router;
