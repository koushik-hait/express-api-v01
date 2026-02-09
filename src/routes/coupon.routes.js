import express from "express";
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  validate,
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  idParamSchema,
} from "../validators/system.validator.js";

const router = express.Router();

// Validate coupon (authenticated users)
router.post(
  "/validate",
  authenticate,
  validateBody(validateCouponSchema),
  validateCoupon,
);

// Admin routes
router.use(authenticate, authorize("admin"));

router.get("/", getCoupons);
router.get("/:id", validateParams(idParamSchema), getCoupon);
router.post("/", validateBody(createCouponSchema), createCoupon);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateCouponSchema }),
  updateCoupon,
);
router.delete("/:id", validateParams(idParamSchema), deleteCoupon);

export default router;
