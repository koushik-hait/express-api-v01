import { Router } from "express";
import { UserRolesEnum } from "../../constants.js";
import {
  createCategory,
  getAllCategories,
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
  .route("/category/all")
  .get(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]), getAllCategories);

export default router;
