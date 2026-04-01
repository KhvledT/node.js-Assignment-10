// API
import express from "express";
import {
  applyTwoStepVerification,
  forgotPassword,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  resetPassword,
  signupWithGoogle,
  updatePassword,
  verifyOtp,
  verifyTwoStepOtp,
} from "./auth.service.js";
import { successResponse } from "../../Common/Response.js";
import { validation } from "../../middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { authentication } from "../../middleware/token.middleware.js";
const authRouter = express.Router();

authRouter.post(
  "/register",
  validation({ registerSchema }),
  async (req, res) => {
    const result = await registerUser(req.body);

    successResponse({
      res,
      data: result,
      message: "User registered successfully",
    });
  },
);

authRouter.post("/login", validation({ loginSchema }), async (req, res) => {
  const result = await loginUser(req.body);
  successResponse({
    res,
    data: result,
  });
});

authRouter.post("/logout", authentication, async (req, res) => {
  const result = await logout(
    req.user.sub,
    req.tokenPayload,
    req.body.logoutAllDevices,
  );
  successResponse({
    res,
    message: "User logged out successfully",
    data: result,
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

authRouter.post("/forgot-password", async (req, res) => {
  await forgotPassword(req.body);
  successResponse({
    res,
    message: "OTP sent to email",
  });
});

authRouter.post("/reset-password", async (req, res) => {
  await resetPassword(req.body);
  successResponse({
    res,
    message: "Password reset successfully",
  });
});

authRouter.post("/update-password", authentication, async (req, res) => {
  await updatePassword(req.user.sub, req.body, req.tokenPayload);
  successResponse({
    res,
    message: "Password updated successfully",
  });
});

authRouter.post(
  "/apply-two-step-verification",
  authentication,
  async (req, res) => {
    const { apply } = req.body;
    await applyTwoStepVerification(req.user.sub, apply);
    successResponse({
      res,
      message: `Two step verification ${apply ? "applied" : "removed"} successfully`,
    });
  },
);

authRouter.post("/verify-two-step-otp", async (req, res) => {
  const result = await verifyTwoStepOtp(req.body);

  successResponse({
    res,
    message: "OTP verified successfully",
    data: result,
  });
});

export default authRouter;
