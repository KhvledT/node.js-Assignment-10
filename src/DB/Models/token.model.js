import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL
tokenSchema.index("expiresAt", { expireAfterSeconds: 0 });

const TokenModel = mongoose.model("Token", tokenSchema);
export default TokenModel;