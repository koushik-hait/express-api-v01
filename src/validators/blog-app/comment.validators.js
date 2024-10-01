import { body, param } from "express-validator";
import { validate } from "../../validators/validate.js";

export const blogIdValidator = (idName) => {
  return [
    param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};

/**
 * Creates a validator for comment creation.
 *
 * @return {Array} An array of validation rules for comment creation.
 */
export const createCommentValidator = () => [
  body("content").notEmpty().withMessage("Content is required"),
  body("author").notEmpty().withMessage("Author is required"),
  body("postId").notEmpty().withMessage("Post ID is required"),
];
