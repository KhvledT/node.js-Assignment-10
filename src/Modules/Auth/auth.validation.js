import Joi from "joi";
import { roleEnum } from "../../Common/enum.js";

export const registerSchema = {
  query: Joi.object({
    lang: Joi.string().valid("en", "ar").default("en"),
  }),
  body: Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),

    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    repeat_password: Joi.ref("password"),

    role: Joi.string()
      .valid(...Object.values(roleEnum))
      .default(roleEnum.USER),

    phone: Joi.string().pattern(new RegExp("^01[0125][0-9]{8}$")).required(),
  }).required(),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),

    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    repeat_password: Joi.ref("password"),
  }).required(),
};
