import mongoose from "mongoose";
import { roleEnum } from "../../Common/enum.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [roleEnum.USER, roleEnum.ADMIN],
      default: roleEnum.USER,
    },
    phone: {
      type: String,
      required: true,
    },
    otp: String,
    otpExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model("User", userSchema);
