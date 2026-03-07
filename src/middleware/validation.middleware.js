
import { validationErrorResponse } from "../Common/Response.js";

export function validation(schema) {
  return (req, res, next) => {
    const validateResult = schema.validate(req.body);
    if (validateResult.error) {
      validationErrorResponse({
        message: validateResult.error.details[0].message,
      });
    }
    next();
  };
}
