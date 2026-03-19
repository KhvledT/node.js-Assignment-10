import Joi from "joi";
import { allowedTypes } from "../../Common/Multer/multer.config.js";

export const pictureSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string()
    .valid(...Object.values(allowedTypes.img))
    .required(),
  destination: Joi.string().required(),
  filename: Joi.string().required(),
  path: Joi.string().required(),
  size: Joi.number().required(),
}).required();

export const pictureSchemaArr = Joi.array().items(pictureSchema).required();

