import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "../controllers/notification.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  validateParams,
  validateBody,
} from "../middleware/validation.middleware.js";
import {
  idParamSchema,
  createNotificationSchema,
} from "../validators/user-features.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getNotifications);
router.put("/:id/read", validateParams(idParamSchema), markAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/:id", validateParams(idParamSchema), deleteNotification);

// Admin only
router.post(
  "/",
  authorize("admin"),
  validateBody(createNotificationSchema),
  createNotification,
);

export default router;
