import express from "express";
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber,
} from "../controllers/newsletter.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  newsletterSchema,
  idParamSchema,
} from "../validators/system.validator.js";

const router = express.Router();

// Public routes
router.post("/subscribe", validateBody(newsletterSchema), subscribe);
router.post("/unsubscribe", validateBody(newsletterSchema), unsubscribe);

// Admin routes
router.use(authenticate, authorize("admin"));

router.get("/", getSubscribers);
router.delete("/:id", validateParams(idParamSchema), deleteSubscriber);

export default router;
