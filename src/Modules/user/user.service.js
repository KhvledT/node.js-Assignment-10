import { ENCRYPTION_KEY } from "../../../config/config.service.js";
import { unauthorizedResponse } from "../../Common/Response.js";
import { UserModel } from "../../DB/Models/user.model.js";
import CryptoJS from "crypto-js";
import path from "path";
import fs from "fs/promises";

// logic
export async function getUserData(userId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    unauthorizedResponse("User not found");
  }
  var phoneBytes = CryptoJS.AES.decrypt(user.phone, ENCRYPTION_KEY);
  var originalPhone = phoneBytes.toString(CryptoJS.enc.Utf8);

  const userData = {
    name: user.name,
    email: user.email,
    phone: JSON.parse(originalPhone),
  };
  return userData;
}

export async function getOtherUserData(userId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    unauthorizedResponse("User not found");
  }
  var phoneBytes = CryptoJS.AES.decrypt(user.phone, ENCRYPTION_KEY);
  var originalPhone = phoneBytes.toString(CryptoJS.enc.Utf8);

  const userData = {
    name: user.name,
    email: user.email,
    phone: JSON.parse(originalPhone),
  };
  user.profileVisitor = (user.profileVisitor || 0) + 1;
  await user.save();
  return userData;
}

export async function uploadProfilePicture(userId, file) {
  const user = await UserModel.findById(userId);
  if (!user) {
    unauthorizedResponse("User not found");
  }

  if (user.profilePicture) {
    const sourcePath = path.resolve(user.profilePicture);
    const fileName = path.basename(user.profilePicture);
    const destPath = path.join(path.resolve("uploads/gallery"), fileName);

    try {
      await fs.rename(sourcePath, destPath);
      console.log("Moved successfully");
    } catch (err) {
      if (err.code === "EXDEV") {
        await fs.copyFile(sourcePath, destPath);
        await fs.unlink(sourcePath);
        console.log("Moved with fallback");
      } else {
        console.error(err);
      }
    }
  }

  user.profilePicture = file.path;
  await user.save();
}

export async function uploadCoverPictures(userId, files) {
  const user = await UserModel.findById(userId);
  if (!user) {
    unauthorizedResponse("User not found");
  }

  user.coverPictures = files.map((file) => file.path);
  await user.save();
}

export async function deleteProfilePicture(userId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    unauthorizedResponse("User not found");
  }

  if (!user.profilePicture) {
    unauthorizedResponse("No profile picture to delete");
  }

  const sourcePath = path.resolve(user.profilePicture);
  await fs.unlink(sourcePath);
  user.profilePicture = null;
  await user.save();
}

export async function getProfileVisitorData(adminId , userId) {
  const admin = await UserModel.findById(adminId);
  if (!admin) {
    unauthorizedResponse("Admin not found");
  }
  if (admin.role !== "admin") {
    unauthorizedResponse("Unauthorized access");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    unauthorizedResponse("User not found");
  }
  return { profileVisitor: user.profileVisitor || 0 };
}