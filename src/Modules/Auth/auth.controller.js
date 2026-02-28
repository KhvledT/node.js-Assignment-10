// API
import express from "express";
import { loginUser, refreshToken, registerUser, verifyOtp } from "./auth.service.js";
import { successResponse } from "../../Common/Response.js";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const result = await registerUser(req.body);
  successResponse({
    res,
    data: result,
    message: "User registered successfully",
  });
});

authRouter.post("/login", async (req, res) => {
  const result = await loginUser(req.body);
  successResponse({
    res,
    data: result,
    message: "User logged in successfully",
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
