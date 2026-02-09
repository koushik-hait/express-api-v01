/**
 * Standardized API response helpers
 */

/**
 * Send a success response
 */
export const sendSuccess = (
  res,
  data,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

/**
 * Send a created response
 */
export const sendCreated = (res, data, message = "Created successfully") => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send a paginated response
 */
export const sendPaginated = (res, data, pagination, message = "Success") => {
  return res.status(200).json({
    status: "success",
    message,
    data,
    pagination,
  });
};

/**
 * Send a no content response
 */
export const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send an error response
 */
export const sendError = (res, message, statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message,
    ...(errors && { errors }),
  });
};
