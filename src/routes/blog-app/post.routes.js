import { Router } from "express";
import {
  addBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  getAllCategories,
} from "../../controllers/blog-app/post.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";

const router = Router();

router
  .route("/create")
  .post(verifyJWT, upload.fields([{ name: "coverPhoto" }]), addBlog);
router
  .route("/update/:bid")
  .put(verifyJWT, upload.fields([{ name: "coverPhoto" }]), updateBlog);

router
  .route("delete/:bid")
  .delete(verifyJWT, mongoIdPathVariableValidator("bid"), deleteBlog);
router.route("/all").get(getAllBlogs);
router.route("/reading/:bid").get(getBlogById);

router.route("/category/all").get(verifyJWT, getAllCategories);

export default router;
