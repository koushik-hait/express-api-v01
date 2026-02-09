import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "../controllers/wishlist.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validation.middleware.js";
import {
  addToWishlistSchema,
  idParamSchema,
} from "../validators/user-features.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/", validateBody(addToWishlistSchema), addToWishlist);
router.delete("/:id", validateParams(idParamSchema), removeFromWishlist);
router.get("/check/:productId", checkWishlist);

export default router;
