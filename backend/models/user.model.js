import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastDate: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    resetPasswordCode: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    verificationCode: { type: String, default: null },
    verificationCodeExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
