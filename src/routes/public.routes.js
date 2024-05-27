import { Router } from "express";
import { getCity, uploadImage } from "../controllers/public.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/city").get(getCity);
router.route("/upload/image").post(upload.single("file"), uploadImage);

export default router;
