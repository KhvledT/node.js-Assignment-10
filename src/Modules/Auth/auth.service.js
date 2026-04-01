import {
  ENCRYPTION_KEY,
  JWT_SECRET_ACCESS_USER,
  JWT_SECRET_ACCESS_ADMIN,
  SALT_ROUNDS,
  JWT_SECRET_REFRESH_USER,
  JWT_SECRET_REFRESH_ADMIN,
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
import {
  generateOTP,
  generateToken,
  verifyGoogleToken,
} from "../../helpers/auth.helper.js";
// import TokenModel from "../../DB/Models/token.model.js";
import * as Redis from "../../DB/redis.service.js";
import { sendMail } from "../../Common/nodemailer.js";

// logic
export async function registerUser(userData) {
  const { name, email, role, password, phone } = userData;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // generate otp
  const otp = generateOTP();

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

  // send otp to email
  await sendMail(email, otp);

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
  console.log(await Redis.get(Redis.login_Attempt_Key(email)));
  
  // check if user is blocked due to too many failed login attempts
  if (await Redis.get(Redis.login_Attempt_Key(email)) === "blocked") {
    unauthorizedResponse("Blocked due to too many failed login attempts, please try again later");
  }

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
    // block user from login for 5 minutes if there are 5 failed login attempts within 5 minutes
    if (await Redis.exists(Redis.login_Attempt_Key(email))) {
      const loginAttempts = await Redis.incr(Redis.login_Attempt_Key(email));
      if (loginAttempts >= 5) {
        await Redis.set({
          key: Redis.login_Attempt_Key(email),
          value: "blocked",
          exType: "EX",
          exValue: 5 * 60, // 5 minutes
        });
      }
    } else {
      await Redis.set({
        key: Redis.login_Attempt_Key(email),
        value: 1,
        exType: "EX",
        exValue: 5 * 60, // 5 minutes
      });
    }

    unauthorizedResponse("Invalid email or password");
  }

  // Two Steps verification (OTP)
  if (user.Apply_Two_Step_Verification) {
    const otp = generateOTP();
    Redis.hSet({
      key: Redis.two_Step_Verification_Otp_Key(user._id),
      field: otp,
      value: "valid",
      exValue: 10 * 60, // 10 minutes
    });
    await sendMail(email, otp);
    return "OTP sent to email for two step verification";
  }

  return generateToken(user);
}

export async function verifyTwoStepOtp(bodyData) {
  const { email, otp } = bodyData;

  const user = await UserModel.findOne({ email });
  if (!user) {
    unauthorizedResponse("user not found");
  }
  const isValid = await Redis.hGet({
    key: Redis.two_Step_Verification_Otp_Key(user._id),
    field: otp,
  });

  if (!isValid) {
    badRequestResponse("Invalid OTP");
  }
  Redis.del(Redis.two_Step_Verification_Otp_Key(user._id));

  return generateToken(user);
}

export async function applyTwoStepVerification(userId, apply = true) {
  const user = await UserModel.findById(userId);
  if (!user) {
    unauthorizedResponse("user not found");
  }
  user.Apply_Two_Step_Verification = apply;
  await user.save();
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

export async function logout(userId, tokenData, logoutAllDevices = false) {
  if (logoutAllDevices) {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { changeCreditTime: Date.now().toString() } },
    );
  } else {
    // await TokenModel.create({
    //   jti: tokenData.jti,
    //   userId: userId,
    //   expiresAt: (tokenData.iat + 60 * 60 * 24 * 365) * 1000, // 1 year >> converted to ms
    // });

    await Redis.set({
      key: Redis.black_List_Token_Key(userId, tokenData.jti),
      value: tokenData.jti,
      exType: "EX",
      exValue: tokenData.exp - (Math.floor(Date.now() / 1000) - tokenData.iat), // 1 year >> converted to seconds
    });
  }
}

export async function forgotPassword(bodyData) {
  const { email } = bodyData;
  const user = await UserModel.findOne({ email });
  if (!user) {
    badRequestResponse("User not found");
  }
  const otp = generateOTP();
  Redis.set({
    key: Redis.forgot_Password_Otp_Key(email),
    value: otp,
    exType: "EX",
    exValue: 10 * 60, // 10 minutes
  });

  await sendMail(email, otp);
}

export async function resetPassword(bodyData) {
  const { email, otp, newPassword } = bodyData;

  const user = await UserModel.findOne({ email });
  if (!user) {
    badRequestResponse("User not found");
  }

  const storedOtp = await Redis.get(Redis.forgot_Password_Otp_Key(email));

  if (otp.toString() !== storedOtp.toString()) {
    badRequestResponse("Invalid OTP");
  }

  await Redis.del(Redis.forgot_Password_Otp_Key(email));

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
}

export async function updatePassword(
  userId,
  { oldPassword, newPassword, confirmPassword },
  tokenData,
) {
  const user = await UserModel.findById(userId);
  if (!user) {
    badRequestResponse("User not found");
  }

  if (newPassword !== confirmPassword) {
    badRequestResponse("New password and confirm password do not match");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    badRequestResponse("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();

  // logout from all devices
  await logout(userId, tokenData, true);
}
