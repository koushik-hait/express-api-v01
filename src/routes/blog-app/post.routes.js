import { Router } from "express";
import {
  addBlog,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByDate,
  getPostsByTag,
  getPostsByUser,
  getPostsByUsername,
  getRecentPosts,
  getTrendingPosts,
  removePostImage,
  search,
  updatePost,
} from "../../controllers/blog-app/post.controllers.js";
import {
  verifyJWT,
  getLoggedInUserOrIgnore,
} from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";

const router = Router();

router
  .route("/create")
  .post(verifyJWT, upload.fields([{ name: "coverPhoto" }]), addBlog);
router.route("/all").get(getAllPosts);
router
  .route("/p/:pid")
  .get(getPostById)
  .patch(verifyJWT, upload.fields([{ name: "coverPhoto" }]), updatePost)
  .delete(deletePost);

router.route("/search").get(search);
//getPostsByUser /get/my/posts
router.route("/my/posts").get(verifyJWT, getPostsByUser);
//getPostsByDate /get/d/:date/posts
router.route("/top/:x/trending").get(getLoggedInUserOrIgnore, getTrendingPosts);
router.route("/top/:x/recent").get(getLoggedInUserOrIgnore, getRecentPosts);
router.route("/:username/posts").get(verifyJWT, getPostsByUsername);
router.route("/t/:tag/posts").get(verifyJWT, getPostsByTag);
router.route("/remove/image/:imageId/:pid").get(verifyJWT, getPostsByTag);

// router.route("/featured").get();
//getPostsByUsername /get/:username/posts
//getPostsByTag /get/t/:tag/posts
//removePostImage /remove/image/:postId/:imageId

// createPost,
//   deletePost,
//   getAllPosts,
//   getMyPosts,
//   getPostById,
//   getPostsByTag,
//   getPostsByUsername,
//   removePostImage,
//   updatePost,

export default router;
