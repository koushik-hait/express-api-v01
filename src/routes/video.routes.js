import { Router } from "express";
import {
  addVideo,
  getAllVideo,
  getVideoById,
} from "../controllers/video.controllers.js";
import { cpUpload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-video").post(cpUpload, addVideo);
router.route("/all-video").get(getAllVideo);
router.route("/watch/:vid").get(getVideoById);

export default router;
