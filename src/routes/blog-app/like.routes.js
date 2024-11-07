import { Router } from "express";
import {
  likeDislikeComment,
  likeDislikePost,
} from "../../controllers/blog-app/like.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";
import { validate } from "../../validators/validate.js";

const router = Router();

router
  .route("/p/:pid")
  .post(
    verifyJWT,
    mongoIdPathVariableValidator("pid"),
    validate,
    likeDislikePost
  );

router
  .route("/c/:cid")
  .post(
    verifyJWT,
    mongoIdPathVariableValidator("cid"),
    validate,
    likeDislikeComment
  );

export default router;
