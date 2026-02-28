import {
  JWT_SECRET_ACCESS_ADMIN,
  JWT_SECRET_ACCESS_USER,
} from "../../config/config.service.js";
import { roleEnum } from "../Common/enum.js";
import { unauthorizedResponse } from "../Common/Response.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    unauthorizedResponse("No token provided");
  }
  const token = authorization.split(" ")[1];

  const decodedToken = jwt.decode(token);

  let secretAccessKey = "";
  switch (decodedToken.aud) {
    case roleEnum.USER:
      secretAccessKey = JWT_SECRET_ACCESS_USER;
      break;
    case roleEnum.ADMIN:
      secretAccessKey = JWT_SECRET_ACCESS_ADMIN;
      break;
  }

  const verify = jwt.verify(token, secretAccessKey);

  if (!verify) {
    unauthorizedResponse("Invalid token");
  }
  req.user = verify;
  next();
};
