import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
} from "../controllers/review.controller.js";
import { getVariants } from "../controllers/variant.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  createReviewSchema,
  updateReviewSchema,
  idParamSchema,
} from "../validators/user-features.validator.js";

const router = express.Router();

// Get product reviews (mounted on products/:productId/reviews)
router.get("/products/:productId/reviews", getProductReviews);

// Get product variants (mounted on products/:productId/variants)
router.get("/products/:productId/variants", getVariants);

// Protected routes
router.use(authenticate);

router.get("/my", getMyReviews);
router.post("/", validateBody(createReviewSchema), createReview);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateReviewSchema }),
  updateReview,
);
router.delete("/:id", validateParams(idParamSchema), deleteReview);

export default router;
