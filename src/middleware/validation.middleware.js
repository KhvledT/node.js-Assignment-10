import { validationErrorResponse } from "../Common/Response.js";

export function validation({ schema, pictureSchema, pictureSchemaArr }) {
  return (req, res, next) => {
    if (schema) {
      let validateErrors = [];
      for (const schemaKey of Object.keys(schema)) {
        const validateResult = schema[schemaKey].validate(req[schemaKey]);
        if (validateResult.error) {
          validateErrors.push(validateResult.error);
        }
      }

      if (validateErrors.length > 0) {
        validationErrorResponse({
          message: validateErrors,
        });
      }
    }

    if (pictureSchema) {
      const validatePictureResult = pictureSchema.validate(req.file);
      if (validatePictureResult.error) {
        validationErrorResponse({
          message: validatePictureResult.error.details[0].message,
        });
      }
    }
    if (pictureSchemaArr) {
      const validatePictureResult = pictureSchemaArr.validate(req.files);
      if (validatePictureResult.error) {
        validationErrorResponse({
          message: validatePictureResult.error.details[0].message,
        });
      }
    }
    next();
  };
}
