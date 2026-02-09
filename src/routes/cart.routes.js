import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  addToCartSchema,
  updateCartItemSchema,
  idParamSchema,
} from "../validators/order.validator.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart data with items
 */
router.get("/", getCart);

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *               variantId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Item added to cart
 */
router.post("/items", validateBody(addToCartSchema), addToCart);

/**
 * @swagger
 * /api/v1/cart/items/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 */
router.put(
  "/items/:id",
  validate({ params: idParamSchema, body: updateCartItemSchema }),
  updateCartItem,
);

/**
 * @swagger
 * /api/v1/cart/items/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Item removed
 */
router.delete("/items/:id", validateParams(idParamSchema), removeCartItem);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete("/", clearCart);

export default router;
