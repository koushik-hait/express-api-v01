import { Router } from "express";
import {
  addBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  getAllCategories,
  addComment,
  getAllPostComments,
  search,
} from "../../controllers/blog-app/post.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";

const router = Router();

router
  .route("/create")
  .post(verifyJWT, upload.fields([{ name: "coverPhoto" }]), addBlog);
router
  .route("/update/:pid")
  .put(verifyJWT, upload.fields([{ name: "coverPhoto" }]), updateBlog);

router
  .route("delete/:pid")
  .delete(verifyJWT, mongoIdPathVariableValidator("pid"), deleteBlog);
router.route("/all").get(getAllBlogs);
router.route("/reading/:pid").get(getBlogById);
//comment routes
router.route("/comment/create").post(verifyJWT, addComment);
router
  .route("/comment/all/:pid")
  .get(verifyJWT, mongoIdPathVariableValidator("pid"), getAllPostComments);
// router.route("/comment/delete/:cid").delete(verifyJWT, mongoIdPathVariableValidator("cid"));
// router.route("/comment/update/:cid").put(verifyJWT, mongoIdPathVariableValidator("cid"));
//category routes
router.route("/category/all").get(verifyJWT, getAllCategories);

router.route("/search").get(search);

export default router;
