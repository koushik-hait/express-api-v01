import { Router } from "express";
import {
  getImages,
  retrieveImage,
  transformImage,
  uploadImage,
} from "../../controllers/image-app/image.comtrollers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import {
  transformImageValidator,
  uploadValidator,
} from "../../validators/image-app/image.validators.js";
import { mongoIdPathVariableValidator } from "../../validators/mongodb.validators.js";
import { validate } from "../../validators/validate.js";

// This is the route that will be used for uploading images

const router = Router();
// POST /images
router
  .route("/images/upload")
  .post(
    verifyJWT,
    upload.single("file"),
    uploadValidator(),
    validate,
    uploadImage
  );
// POST /images/:id/transform
router.route("/images/:id/transform").post(
  verifyJWT,
  mongoIdPathVariableValidator("id"), //transformImageValidator is not used
  validate,
  transformImage
);

// GET /images/:id
router
  .route("/images/:id")
  .get(verifyJWT, mongoIdPathVariableValidator("id"), validate, retrieveImage);

// GET /images?page=1&limit=10
router.route("/images").get(verifyJWT, getImages);

export default router;
