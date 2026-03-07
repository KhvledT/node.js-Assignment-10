import { JWT_SECRET_ACCESS_ADMIN, JWT_SECRET_ACCESS_USER, JWT_SECRET_REFRESH_ADMIN, JWT_SECRET_REFRESH_USER, WEB_CLIENT_ID } from "../../config/config.service.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { roleEnum } from "../Common/enum.js";

export async function verifyGoogleToken(idToken) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  // const userid = payload["sub"];
  return payload;
}

export function generateToken(user) {

  let secretAccessKey = "";
  let secretRefreshKey = "";
  switch (user.role) {
    case roleEnum.USER:
      secretAccessKey = JWT_SECRET_ACCESS_USER;
      secretRefreshKey = JWT_SECRET_REFRESH_USER;
      break;

    case roleEnum.ADMIN:
      secretAccessKey = JWT_SECRET_ACCESS_ADMIN;
      secretRefreshKey = JWT_SECRET_REFRESH_ADMIN;
      break;
  }

  // generate access token
  const accessToken = jwt.sign({}, secretAccessKey, {
    audience: user.role,
    expiresIn: "1h",
    subject: user._id.toString(),
  });

  // generate refresh token
  const refreshToken = jwt.sign({}, secretRefreshKey, {
    audience: user.role,
    expiresIn: "1y",
    subject: user._id.toString(),
  });

  return { accessToken, refreshToken };
}