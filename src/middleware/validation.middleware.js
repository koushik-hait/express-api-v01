import { ValidationError } from "../utils/errors.js";

/**
 * Generic Zod validation middleware
 * @param {object} schema - Zod schema object with optional body, query, params schemas
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const errors = [];

      // Validate request body
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map((e) => ({
              field: `body.${e.path.join(".")}`,
              message: e.message,
            })),
          );
        } else {
          req.body = result.data;
        }
      }

      // Validate query parameters
      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map((e) => ({
              field: `query.${e.path.join(".")}`,
              message: e.message,
            })),
          );
        } else {
          req.query = result.data;
        }
      }

      // Validate URL parameters
      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map((e) => ({
              field: `params.${e.path.join(".")}`,
              message: e.message,
            })),
          );
        } else {
          req.params = result.data;
        }
      }

      if (errors.length > 0) {
        throw new ValidationError("Validation failed", errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate request body only
 */
export const validateBody = (schema) => validate({ body: schema });

/**
 * Validate query parameters only
 */
export const validateQuery = (schema) => validate({ query: schema });

/**
 * Validate URL parameters only
 */
export const validateParams = (schema) => validate({ params: schema });
