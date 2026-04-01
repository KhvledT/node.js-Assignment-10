import mongoose from "mongoose";
import { providerEnum, roleEnum } from "../../Common/enum.js";

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
      required: function () {
        return this.provider === providerEnum.SYSTEM;
      },
    },
    role: {
      type: String,
      enum: [roleEnum.USER, roleEnum.ADMIN],
      default: roleEnum.USER,
    },
    phone: {
      type: String,
      required: function () {
        return this.provider === providerEnum.SYSTEM;
      },
    },
    profilePicture: {
      type: String,
    },
    coverPictures: {
      type: [String],
    },
    profileVisitor: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.SYSTEM,
    },
    changeCreditTime: String,
    otp: String,
    otpExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    Apply_Two_Step_Verification: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
// Index to automatically delete unverified users after 24 hours
userSchema.index("isVerified", { expireAfterSeconds: 60 * 60 * 24 }); // 24 hours

export const UserModel = mongoose.model("User", userSchema);
