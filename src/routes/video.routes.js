import { Router } from "express";
import {
  addVideo,
  getAllVideo,
  getVideoById,
} from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { cpUpload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-video").post(verifyJWT, cpUpload, addVideo);
router.route("/all-video").get(getAllVideo);
router.route("/watch/:vid").get(getVideoById);

export default router;
