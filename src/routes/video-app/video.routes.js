import { Router } from "express";
import {
  addVideo,
  getAllVideo,
  getVideoById,
  getAllCategories,
} from "../../controllers/video-app/video.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { cpUpload } from "../../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-video").post(verifyJWT, cpUpload, addVideo);
router.route("/all-videos").get(getAllVideo);
router.route("/watch/:vid").get(getVideoById);

//comment routes
// router.route("/comment/create").post(verifyJWT, addComment);
// router
//   .route("/comment/all/:pid")
//   .get(verifyJWT, mongoIdPathVariableValidator("pid"), getAllPostComments);
// router.route("/comment/delete/:cid").delete(verifyJWT, mongoIdPathVariableValidator("cid"));
// router.route("/comment/update/:cid").put(verifyJWT, mongoIdPathVariableValidator("cid"));
//category routes
router.route("/category/all").get(verifyJWT, getAllCategories);

export default router;
