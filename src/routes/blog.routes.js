import { Router } from "express";
import {
  addBlog,
  getAllBlogs,
  getBlogById,
} from "../controllers/blog.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/create")
  .post(verifyJWT, upload.fields([{ name: "coverPhoto" }]), addBlog);
router.route("/all-blog").get(getAllBlogs);
router.route("/reading/:bid").get(getBlogById);

export default router;
