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
import { roleEnum } from "../../Common/enum.js";
import {
  conflictResponse,
  unauthorizedResponse,
} from "../../Common/Response.js";
import { UserModel } from "../../DB/Models/user.model.js";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// logic
export async function registerUser(userData) {
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
    otpExpires: Date.now() + 10 * 60 * 1000, // 10 دقائق
    isVerified: false,
  });

  await transporter.sendMail({
    from: `"خالد بيمسي" <${process.env.EMAIL}>`,
    to: email,
    subject: "Your Verification Code",
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
  if(!user.isVerified){
    unauthorizedResponse("your account isn't verified")
  }

  // compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    unauthorizedResponse("Invalid email or password");
  }

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
