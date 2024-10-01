import { body, param } from "express-validator";

const createPostValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("coverPhoto").notEmpty().withMessage("Cover photo is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("author").notEmpty().withMessage("Author is required"),
  body("status").notEmpty().withMessage("Status is required"),
  body("tags").notEmpty().withMessage("Tags are required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
    return res.status(422).json({
      errors: extractedErrors,
    });
  },
];

const usernamePathVariableValidator = () => {
  return [
    param("username").toLowerCase().notEmpty().withMessage("Invalid username"),
  ];
};

const tagPathVariableValidator = () => {
  return [param("tag").notEmpty().withMessage("Tag is required")];
};

export {
  createPostValidator,
  tagPathVariableValidator,
  usernamePathVariableValidator,
};
