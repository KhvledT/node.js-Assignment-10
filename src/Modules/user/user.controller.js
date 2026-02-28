// API
import express from "express";
import { verifyToken } from "../../middleware/token.middleware.js";
import { successResponse } from "../../Common/Response.js";
import { getUserData } from "./user.service.js";

const userRouter = express.Router();

userRouter.get("/profile", verifyToken, async (req, res) => {
    const result = await getUserData(req.user.sub);
    successResponse({ res, data: result });
});

export default userRouter;
