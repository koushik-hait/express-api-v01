import express from "express";
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  authenticate,
  authorize,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  uploadProductImages,
  handleUploadError,
} from "../middleware/upload.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  productQuerySchema,
} from "../validators/product.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", validate({ query: productQuerySchema }), getProducts);

/**
 * @swagger
 * /api/v1/products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data
 */
router.get("/slug/:slug", getProductBySlug);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product data with variants and tags
 */
router.get("/:id", validateParams(idParamSchema), getProduct);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Product created
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  uploadProductImages,
  handleUploadError,
  validate({ body: createProductSchema }),
  createProduct,
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
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
 *         description: Product updated
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  uploadProductImages,
  handleUploadError,
  validate({ params: idParamSchema, body: updateProductSchema }),
  updateProduct,
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
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
 *         description: Product deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  deleteProduct,
);

export default router;
