import express from "express";
import {
  getSettings,
  getSetting,
  upsertSetting,
  deleteSetting,
  getPublicSettings,
} from "../controllers/settings.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validation.middleware.js";
import { settingSchema } from "../validators/system.validator.js";

const router = express.Router();

// Public settings
router.get("/public", getPublicSettings);

// Admin routes
router.use(authenticate, authorize("admin"));

router.get("/", getSettings);
router.get("/:group/:key", getSetting);
router.post("/", validateBody(settingSchema), upsertSetting);
router.delete("/:group/:key", deleteSetting);

export default router;
