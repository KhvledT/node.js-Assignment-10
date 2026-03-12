import {
  ENCRYPTION_KEY,
  JWT_SECRET_ACCESS_USER,
  JWT_SECRET_ACCESS_ADMIN,
  SALT_ROUNDS,
  JWT_SECRET_REFRESH_USER,
  JWT_SECRET_REFRESH_ADMIN,
  NODEMAILER_USER,
  NODEMAILER_PASS,
} from "../../../config/config.service.js";
import { providerEnum, roleEnum } from "../../Common/enum.js";
import {
  badRequestResponse,
  conflictResponse,
  unauthorizedResponse,
} from "../../Common/Response.js";
import { UserModel } from "../../DB/Models/user.model.js";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { generateToken, verifyGoogleToken } from "../../helpers/auth.helper.js";

// logic
export async function registerUser(userData, file) {
  console.log(file);
  
  const { name, email, role, password, phone } = userData;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  });

  // generate otp
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const encryptedPhone = CryptoJS.AES.encrypt(
    JSON.stringify(phone),
    ENCRYPTION_KEY,
  ).toString();

  // encrybt otp
  const hashedOtp = await bcrypt.hash(otp, 10);

  await UserModel.create({
    name,
    email,
    role,
    password: hashedPassword,
    phone: encryptedPhone,
    otp: hashedOtp,
    picture: file.destination + "/" + file.filename || "",
    otpExpires: Date.now() + 10 * 60 * 1000, // 10 دقائق
    isVerified: false,
  });

  await transporter.sendMail({
    from: `Saraha App`,
    to: email,
    subject: "Your Verification Code for Saraha App",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });

  return { message: "OTP sent to email" };
}

export async function verifyOtp(bodyData) {
  const { email, otpInput } = bodyData;
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.otpExpires < Date.now()) {
    throw new Error("OTP expired");
  }

  const isMatch = await bcrypt.compare(otpInput, user.otp);

  if (!isMatch) {
    throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  return { message: "Account verified successfully" };
}

export async function loginUser(loginData) {
  // check if user exists
  const { email, password } = loginData;
  const user = await UserModel.findOne({ email });
  if (!user) {
    unauthorizedResponse("Invalid email or password");
  }
  if (!user.isVerified) {
    unauthorizedResponse("your account isn't verified");
  }

  // compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    unauthorizedResponse("Invalid email or password");
  }

  return generateToken(user);
}

export async function signupWithGoogle(googleData, type = "signed up") {
  const { idToken } = googleData;

  if (!idToken) {
    badRequestResponse("idToken is required");
  }
  const payload = await verifyGoogleToken(idToken);

  if (!payload.email_verified) {
    badRequestResponse("Google account email not verified");
  }

  const user = await UserModel.findOne({ email: payload.email });
  if (user) {
    if (user.provider === providerEnum.SYSTEM) {
      badRequestResponse(
        "User already exists with this email, login with email and password",
      );
    }
    return loginWithGoogle(googleData);
  }

  await UserModel.create({
    name: payload?.name,
    email: payload?.email,
    picture: payload?.picture,
    provider: providerEnum.GOOGLE,
    isVerified: true,
  });
  return loginWithGoogle(googleData, type);
}

export async function loginWithGoogle(googleData, type = "logged in") {
  const { idToken } = googleData;
  if (!idToken) {
    badRequestResponse("idToken is required");
  }
  const payload = await verifyGoogleToken(idToken);

  if (!payload.email_verified) {
    badRequestResponse("Google account email not verified");
  }

  const user = await UserModel.findOne({
    email: payload.email,
    provider: providerEnum.GOOGLE,
  });
  if (!user) {
    return signupWithGoogle(googleData);
  }

  const { accessToken, refreshToken } = generateToken(user);

  return { accessToken, refreshToken, type };
}

export async function refreshToken(refreshToken) {
  const decodedToken = jwt.decode(refreshToken);
  if (!decodedToken) {
    unauthorizedResponse("Invalid refresh token");
  }

  let secretRefreshKey = "";
  switch (decodedToken.aud) {
    case roleEnum.USER:
      secretRefreshKey = JWT_SECRET_REFRESH_USER;
      break;

    case roleEnum.ADMIN:
      secretRefreshKey = JWT_SECRET_REFRESH_ADMIN;
      break;
  }

  const verify = jwt.verify(refreshToken, secretRefreshKey);

  if (!verify) {
    unauthorizedResponse("Invalid refresh token");
  }

  // generate new access token
  let secretAccessKey = "";
  switch (decodedToken.aud) {
    case roleEnum.USER:
      secretAccessKey = JWT_SECRET_ACCESS_USER;
      break;
    case roleEnum.ADMIN:
      secretAccessKey = JWT_SECRET_ACCESS_ADMIN;
      break;
  }

  const newAccessToken = jwt.sign({}, secretAccessKey, {
    audience: decodedToken.aud,
    expiresIn: "1h",
    subject: decodedToken.sub,
  });

  return { accessToken: newAccessToken };
}
