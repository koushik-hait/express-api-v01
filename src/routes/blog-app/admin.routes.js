import { Router } from "express";
import { UserRolesEnum } from "../../constants.js";
import {
  createCategory,
  getAllCategories,
  getAllPosts,
  getAllUsers,
  getAllTags,
} from "../../controllers/blog-app/admin.controllers.js";
import {
  verifyJWT,
  verifyPermission,
} from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";

const router = Router();

router
  .route("/category/create")
  .post(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), createCategory);

// router
//   .route("/admin/category/:cid")
//   .delete(
//     verifyJWT,
//     verifyPermission[UserRolesEnum.ADMIN],
//     mongoIdPathVariableValidator("cid"),
//     addCategory
//   );

router
  .route("/users/all")
  .get(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), getAllUsers);

router
  .route("/posts/all")
  .get(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), getAllPosts);

router
  .route("/category/all")
  .get(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), getAllCategories);

router
  .route("/tag/all")
  .get(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), getAllTags);

export default router;
