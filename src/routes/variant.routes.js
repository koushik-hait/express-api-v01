import express from "express";
import {
  getVariants,
  getVariant,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/variant.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  createVariantSchema,
  updateVariantSchema,
  idParamSchema,
} from "../validators/product.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/variants/{id}:
 *   get:
 *     summary: Get variant by ID
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Variant data
 */
router.get("/:id", validateParams(idParamSchema), getVariant);

/**
 * @swagger
 * /api/v1/variants:
 *   post:
 *     summary: Create product variant
 *     tags: [Variants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVariant'
 *     responses:
 *       201:
 *         description: Variant created
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateBody(createVariantSchema),
  createVariant,
);

/**
 * @swagger
 * /api/v1/variants/{id}:
 *   put:
 *     summary: Update variant
 *     tags: [Variants]
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
 *         description: Variant updated
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate({ params: idParamSchema, body: updateVariantSchema }),
  updateVariant,
);

/**
 * @swagger
 * /api/v1/variants/{id}:
 *   delete:
 *     summary: Delete variant
 *     tags: [Variants]
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
 *         description: Variant deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  deleteVariant,
);

export default router;
