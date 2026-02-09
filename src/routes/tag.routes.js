import express from "express";
import {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tag.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  createTagSchema,
  updateTagSchema,
  idParamSchema,
} from "../validators/product.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
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
 *         description: List of tags
 */
router.get("/", getTags);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag data
 */
router.get("/:id", validateParams(idParamSchema), getTag);

/**
 * @swagger
 * /api/v1/tags:
 *   post:
 *     summary: Create new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTag'
 *     responses:
 *       201:
 *         description: Tag created
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateBody(createTagSchema),
  createTag,
);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   put:
 *     summary: Update tag
 *     tags: [Tags]
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
 *         description: Tag updated
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate({ params: idParamSchema, body: updateTagSchema }),
  updateTag,
);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   delete:
 *     summary: Delete tag
 *     tags: [Tags]
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
 *         description: Tag deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  deleteTag,
);

export default router;
