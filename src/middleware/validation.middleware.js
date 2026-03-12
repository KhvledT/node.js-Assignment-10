import { validationErrorResponse } from "../Common/Response.js";

export function validation(schema, pictureSchema) {
  return (req, res, next) => {
    const validateResult = schema.validate(req.body);
    if (validateResult.error) {
      validationErrorResponse({
        message: validateResult.error.details[0].message,
      });
    }
    if (pictureSchema) {
      const validatePictureResult = pictureSchema.validate(req.file);
      if (validatePictureResult.error) {
        validationErrorResponse({
          message: validatePictureResult.error.details[0].message,
        });
      }
    }
    next();
  };
}
