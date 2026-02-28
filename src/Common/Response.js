// respose logic
import { NODE_ENV } from "../../config/config.service.js";

export const globalErrorHandler = (error, req, res, next) => {
  return NODE_ENV === "dev"
    ? res
        .status(error.cause?.status ?? 500)
        .json({ message: error.message, stack: error.stack })
    : res
        .status(error.cause?.status ?? 500)
        .json({ message: error.message || "something went wrong!" });
};

export const successResponse = (
  {res,
  data,
  message = "Success",
  statusCode = 200,}
) => {
  res.status(statusCode).json({ message, data });
};

export const errorResponse = (message = "Error", statusCode = 500) => {
  throw new Error(message, { cause: statusCode });
};

export const notFoundResponse = (message = "Not Found") => {
  throw new Error(message, { cause: 404 });
};

export const badRequestResponse = (message = "Bad Request") => {
  throw new Error(message, { cause: 400 });
};

export const unauthorizedResponse = (message = "Unauthorized") => {
  throw new Error(message, { cause: 401 });
};

export const conflictResponse = (message = "Conflict") => {
  throw new Error(message, { cause: 409 });
};
