// API
import express from "express";
import { authentication } from "../../middleware/token.middleware.js";
import { successResponse } from "../../Common/Response.js";
import { deleteProfilePicture, getOtherUserData, getProfileVisitorData, getUserData, uploadCoverPictures, uploadProfilePicture } from "./user.service.js";
import localPayload, {
  allowedTypes,
} from "../../Common/Multer/multer.config.js";
import { validation } from "../../middleware/validation.middleware.js";
import { pictureSchema, pictureSchemaArr } from "./user.validation.js";

const userRouter = express.Router();

userRouter.post(
  "/upload-profile-picture",
  authentication,
  localPayload({ fileDist: "user", allowedMimeTypes: allowedTypes.img }).single(
    "profilePicture",
  ),
  validation({ pictureSchema }),
  async (req, res) => {
    const result = await uploadProfilePicture(req.user.sub, req.file);
    successResponse({ res, data: result, message: "Profile picture uploaded successfully" });
  },
);

userRouter.post(
  "/upload-cover-pictures",
  authentication,
  localPayload({ fileDist: "user", allowedMimeTypes: allowedTypes.img }).array(
    "coverPictures",
    2
  ),
  validation({ pictureSchemaArr }),
  async (req, res) => {
    const result = await uploadCoverPictures(req.user.sub, req.files);
    successResponse({ res, data: result, message: "Cover pictures uploaded successfully" });
  },
);

userRouter.delete("/delete-profile-picture", authentication, async (req, res) => {
    const result = await deleteProfilePicture(req.user.sub);
    successResponse({ res, data: result, message: "Profile picture deleted successfully" });
});

userRouter.get("/profile", authentication, async (req, res) => {
  const result = await getUserData(req.user.sub);
  successResponse({ res, data: result });
});

userRouter.get("/profile/:userId", authentication, async (req, res) => {
  const result = await getOtherUserData(req.params.userId);
  successResponse({ res, data: result });
});

userRouter.get("/profileVisitor/:userId", authentication, async (req, res) => {
    const result = await getProfileVisitorData( req.user.sub, req.params.userId);
    successResponse({ res, data: result });
});

export default userRouter;
