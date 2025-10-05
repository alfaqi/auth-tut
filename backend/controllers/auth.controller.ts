import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.ts";

import {
  generateExpiryDate,
  generateRefreshTokenAndSetCookie,
  generateTokenAndSetCookie,
  generateCode,
  verifyJWTToken,
} from "../utils/utils.ts";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendResetPasswordSuccessEmail,
} from "../resend/emails.ts";

interface AuthRequest extends Request {
  userId?: string;
}

export const checkAuth = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ success: false, message: "Error in checkAuth" });
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ success: false, message: "All fields are required" });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateCode();
    const verificationCodeExpiresAt = generateExpiryDate(60);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiresAt,
    });

    console.log(user);

    const token = generateTokenAndSetCookie(res, user._id.toString());

    await sendVerificationEmail(user.email, verificationCode);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          ...user.toObject(),
          password: undefined,
        },
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      {
        verificationCode: code,
        verificationCodeExpiresAt: { $gt: new Date() },
      },
      {
        $set: { isVerified: true },
        $unset: {
          verificationCode: "",
          verificationCodeExpiresAt: "",
        },
      },
      { new: true }
    );

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
      return;
    }

    await sendWelcomeEmail(user.email, user.name);

    res.status(201).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          ...user.toObject(),
          password: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Error verifying email" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const accessToken = generateTokenAndSetCookie(res, user._id.toString());
    const refreshToken = generateRefreshTokenAndSetCookie(
      res,
      user._id.toString()
    );

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          ...user.toObject(),
          password: undefined,
        },
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Error in login" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("accessToken");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    const resetPasswordToken = crypto.randomBytes(24).toString("hex");
    const resetPasswordExpiresAt = generateExpiryDate(60);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();

    await sendResetPasswordEmail(user.email, resetPasswordToken);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res
      .status(500)
      .json({ success: false, message: "Error in forgot password" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: new Date() },
      },
      {
        $set: { password: hashedPassword },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpiresAt: "",
        },
      },
      { new: true }
    );

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset password token",
      });
      return;
    }

    await sendResetPasswordSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    res
      .status(500)
      .json({ success: false, message: "Error in reset password" });
  }
};

export const welcome = async (req: Request, res: Response): Promise<void> => {
  const { email, name } = req.body;
  await sendWelcomeEmail(email, name);
  res.status(200).json({
    success: true,
    message: "Sent welcome email successfully",
  });
};

export const refreshAccessToken = (req: Request, res: Response): void => {
  const accessToken = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;
  if (!accessToken) {
    res.status(401).json({ success: false, message: "User must login" });
    return;
  }

  if (!refreshToken) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyJWTToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId?: string } | null;

    if (!decoded || !decoded.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const token = generateTokenAndSetCookie(res, decoded.userId);

    res
      .status(200)
      .json({ success: true, message: "Access token refreshed", token });
  } catch (error) {
    console.error("Error while refreshing access token:", error);
    res
      .status(500)
      .json({ success: false, message: "Error while refreshing access token" });
  }
};
