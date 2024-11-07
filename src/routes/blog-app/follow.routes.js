import { Router } from "express";
import {
  followUnFollowUser,
  getFollowersListByUserName,
  getFollowingListByUserName,
} from "../../controllers/blog-app/follow.controllers.js";
import {
  getLoggedInUserOrIgnore,
  verifyJWT,
} from "../../middlewares/auth.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";
import { validate } from "../../validators/validate.js";

const router = Router();

router
  .route("/:toBeFollowedUserId")
  .post(
    verifyJWT,
    mongoIdPathVariableValidator("toBeFollowedUserId"),
    validate,
    followUnFollowUser
  );

router
  .route("/list/followers/:username")
  .get(getLoggedInUserOrIgnore, getFollowersListByUserName);

router
  .route("/list/following/:username")
  .get(getLoggedInUserOrIgnore, getFollowingListByUserName);

export default router;
