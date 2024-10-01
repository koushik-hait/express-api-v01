import { Router } from "express";
import {
  addComment,
  deleteComment,
  getPostComments,
  updateComment,
} from "../../controllers/blog-app/comment.controllers.js";
import {
  getLoggedInUserOrIgnore,
  verifyJWT,
} from "../../middlewares/auth.middleware.js";
import { createCommentValidator } from "../../validators/blog-app/comment.validators.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";
import { validate } from "../../validators/validate.js";

const router = Router();

router
  .route("/p/:pid")
  .get(
    getLoggedInUserOrIgnore,
    mongoIdPathVariableValidator("pid"),
    validate,
    getPostComments
  )
  .post(
    verifyJWT,
    mongoIdPathVariableValidator("pid"),
    createCommentValidator(),
    validate,
    addComment
  );

router
  .route("/:cid")
  .delete(verifyJWT, mongoIdPathVariableValidator("cid"), deleteComment)
  .patch(
    verifyJWT,
    mongoIdPathVariableValidator("cid"),
    createCommentValidator(),
    validate,
    updateComment
  );

// router.route("/create").post(verifyJWT, addComment);
// router
//   .route("/all/:pid")
//   .get(verifyJWT, mongoIdPathVariableValidator("pid"), getAllPostComments);
// router
//   .route("/comment/delete/:cid")
//   .delete(verifyJWT, mongoIdPathVariableValidator("cid"));
// router
//   .route("/comment/update/:cid")
//   .put(verifyJWT, mongoIdPathVariableValidator("cid"));

export default router;
