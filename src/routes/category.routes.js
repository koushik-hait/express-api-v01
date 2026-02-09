import express from "express";
import {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
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
  uploadSingleImage,
  getFileUrl,
  handleUploadError,
} from "../middleware/upload.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
  categoryQuerySchema,
} from "../validators/product.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
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
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", validate({ query: categoryQuerySchema }), getCategories);

/**
 * @swagger
 * /api/v1/categories/tree:
 *   get:
 *     summary: Get category tree (nested structure)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category tree
 */
router.get("/tree", getCategoryTree);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category data
 */
router.get("/:id", validateParams(idParamSchema), getCategory);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategory'
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  uploadSingleImage,
  handleUploadError,
  (req, res, next) => {
    if (req.file) {
      req.body.image = getFileUrl(req.file);
    }
    next();
  },
  validate({ body: createCategorySchema }),
  createCategory,
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
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
 *         description: Category updated
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  uploadSingleImage,
  handleUploadError,
  (req, res, next) => {
    if (req.file) {
      req.body.image = getFileUrl(req.file);
    }
    next();
  },
  validate({ params: idParamSchema, body: updateCategorySchema }),
  updateCategory,
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
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
 *         description: Category deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  deleteCategory,
);

export default router;
