import { Router } from "express";
import { getAllCategories } from "../../controllers/blog-app/category.controllers.js";
import { getPostsByCategory } from "../../controllers/blog-app/post.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(verifyJWT, getAllCategories);
router.route("/:category/posts").get(verifyJWT, getPostsByCategory);
//getPostsByCategory /get/:category/posts

export default router;
