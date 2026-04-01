import {
  JWT_SECRET_ACCESS_ADMIN,
  JWT_SECRET_ACCESS_USER,
} from "../../config/config.service.js";
import { roleEnum } from "../Common/enum.js";
import { unauthorizedResponse } from "../Common/Response.js";
import jwt from "jsonwebtoken";
import TokenModel from "../DB/Models/token.model.js";
import { UserModel } from "../DB/Models/user.model.js";
import * as Redis from "../DB/redis.service.js";

export const authentication = async (req, res, next) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    return unauthorizedResponse("No token provided");
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

  const verifyToken = jwt.verify(token, secretAccessKey);

  if (!verifyToken) {
    return unauthorizedResponse("Invalid token");
  }

  // if (await TokenModel.findOne({ jti: decodedToken.jti })) {
  //   unauthorizedResponse("You have been logged out, please login again");
  // }

  if(await Redis.get(Redis.black_List_Token_Key(decodedToken.sub, decodedToken.jti))){
    return unauthorizedResponse("You have been logged out, please login again");
  }

  const user = await UserModel.findById(verifyToken.sub);

  if (!user) {
    return unauthorizedResponse("User not found");
  }

  if (verifyToken.iat * 1000 < user.changeCreditTime) {
    return unauthorizedResponse(
      "You have been logged out from all devices, please login again",
    );
  }

  req.user = verifyToken;
  req.tokenPayload = decodedToken;

  next();
};
