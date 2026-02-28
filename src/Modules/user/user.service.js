import {
  ENCRYPTION_KEY
} from "../../../config/config.service.js";
import {
  unauthorizedResponse,
} from "../../Common/Response.js";
import { UserModel } from "../../DB/Models/user.model.js";
import CryptoJS from "crypto-js";

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
