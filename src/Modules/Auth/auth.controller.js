// API
import express from "express";
import {
  loginUser,
  refreshToken,
  registerUser,
  signupWithGoogle,
  verifyOtp,
} from "./auth.service.js";
import { successResponse } from "../../Common/Response.js";
import { validation } from "../../middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import upload from "../../Common/Multer/multer.config.js";
const authRouter = express.Router();

authRouter.post(
  "/register",
  upload.single("picture"),
  validation(registerSchema),
  async (req, res) => {
    const result = await registerUser(req.body, req.file);

    successResponse({
      res,
      data: result,
      message: "User registered successfully",
    });
  },
);

authRouter.post("/login", validation(loginSchema), async (req, res) => {
  const result = await loginUser(req.body);
  successResponse({
    res,
    data: result,
    message: "User logged in successfully",
  });
});

authRouter.post("/signup/gmail", async (req, res) => {
  const result = await signupWithGoogle(req.body);
  successResponse({
    res,
    data: result,
    message: `User ${result.type} successfully`,
  });
});

authRouter.post("/login/gmail", async (req, res) => {
  const result = await loginWithGoogle(req.body);
  successResponse({
    res,
    data: result,
    message: `User ${result.type} successfully`,
  });
});

authRouter.post("/verify-otp", async (req, res) => {
  const { message } = await verifyOtp(req.body);
  successResponse({
    res,
    message,
  });
});

authRouter.post("/refresh-token", async (req, res) => {
  const { token } = req.body;

  const result = await refreshToken(token);
  successResponse({
    res,
    data: result,
    message: "Token refreshed successfully",
  });
});

export default authRouter;
