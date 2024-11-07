import { Router } from "express";
import {
  getBookMarkedPosts,
  bookmarkUnBookmarkPost,
} from "../../controllers/blog-app/bookmark.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";
import { validate } from "../../validators/validate.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getBookMarkedPosts); // getBookMarkedPosts controller is present in posts controller due to utility function dependency

router
  .route("/p/:pid")
  .post(mongoIdPathVariableValidator("pid"), validate, bookmarkUnBookmarkPost);

export default router;
