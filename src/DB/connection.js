// Database connection logic

import mongoose from "mongoose";
import { DB_ATLAS } from "../../config/config.service.js";

export async function DB_Connection() {
  try {
    await mongoose.connect(DB_ATLAS);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection error:", error);
  }
}
