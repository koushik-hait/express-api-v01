import { Router } from "express";
import { uploadImage } from "../controllers/public.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload/image").post(upload.single("file"), uploadImage);

export default router;
