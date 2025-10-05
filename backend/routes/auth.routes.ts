import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  welcome,
  refreshAccessToken,
} from "../controllers/auth.controller.ts";
import { verifyToken } from "../middleware/verifyToken.ts";
import {
  refreshAccessTokenRateLimit,
  resetPasswordRateLimit,
  signupRateLimit,
  verifyEmailRateLimit,
  loginRateLimit,
  forgotPasswordRateLimit,
} from "../middleware/rateLimit.ts";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.post("/refresh", refreshAccessTokenRateLimit, refreshAccessToken);

router.post("/signup", signupRateLimit, signup);
router.post("/login", loginRateLimit, login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmailRateLimit, verifyEmail);
router.post("/forgot-password", forgotPasswordRateLimit, forgotPassword);
router.post("/reset-password/:token", resetPasswordRateLimit, resetPassword);

router.post("/welcome", welcome);

export default router;
