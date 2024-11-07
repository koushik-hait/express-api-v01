import { body, check, param } from "express-validator";
import { AvailableUserRoles } from "../../constants.js";

//file upload validator
export const uploadValidator = () => [
  check("file").custom((value, { req }) => {
    if (!req.file) {
      console.log("No file uploaded");
      throw new Error("No file uploaded");
    }
    if (req.file.size > 5 * 1024 * 1024) {
      console.log("File size exceeds 5MB limit");
      throw new Error("File size exceeds 5MB limit");
    }
    // if (!["image/jpeg", "image/png"].includes(req.file.mimetype)) {
    //   throw new Error("Only JPEG and PNG files are allowed");
    // }
    return true;
  }),
];

export const transformImageValidator = () => [
  param("id").isMongoId().withMessage("Invalid image id"),
  body("transformations")
    .isObject()
    .withMessage("transformations must be an object")
    .custom((value, { req }) => {
      const { transformations } = req.body;
      if (
        transformations.resize &&
        (transformations.resize.width === undefined ||
          transformations.resize.height === undefined)
      ) {
        throw new Error("resize width and height are required");
      }
      if (
        transformations.crop &&
        (transformations.crop.width === undefined ||
          transformations.crop.height === undefined ||
          transformations.crop.x === undefined ||
          transformations.crop.y === undefined)
      ) {
        throw new Error("crop width, height, x and y are required");
      }
      if (
        transformations.filters &&
        (transformations.filters.grayscale === undefined ||
          transformations.filters.sepia === undefined)
      ) {
        throw new Error("grayscale and sepia filters must be boolean");
      }
      return true;
    }),
];
