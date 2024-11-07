import { Router } from "express";
import {
  getCurrentUser,
  getProfileByUserName,
  getTop5Users,
  updateCoverImage,
  updateUserProfile,
} from "../../controllers/blog-app/profile.controllers.js";
import {
  getLoggedInUserOrIgnore,
  verifyJWT,
} from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";

const router = Router();

router.route("/current-user").get(verifyJWT, getCurrentUser);

// public route
router.route("/u/:username").get(verifyJWT, getProfileByUserName);

router.route("/").get(getCurrentUser).patch(verifyJWT, updateUserProfile);
router.route("/top/:x/author").get(getLoggedInUserOrIgnore, getTop5Users);

router
  .route("/cover-image")
  .patch(upload.single("coverImage"), updateCoverImage);

export default router;
