import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";

import {
  generateExpiryDate,
  generateRefreshTokenAndSetCookie,
  generateTokenAndSetCookie,
  generateVerificationCode,
  verifyJWTToken,
} from "../utils/utils.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendResetPasswordSuccessEmail,
} from "../resend/emails.js";

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ success: false, message: "Error in checkAuth" });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = generateExpiryDate(60);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiresAt,
    });

    console.log(user);

    const token = generateTokenAndSetCookie(res, user._id);

    await sendVerificationEmail(user.email, verificationCode);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          ...user._doc,
          password: undefined,
        },
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
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
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    await sendWelcomeEmail(user.email, user.name);

    res.status(201).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          ...user._doc,
          password: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Error verifying email" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, user._id);
    generateRefreshTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          ...user._doc,
          password: undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Error in login" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
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

export const resetPassword = async (req, res) => {
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
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset password token",
      });
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

export const welcome = async (req, res) => {
  const { email, name } = req.body;
  await sendWelcomeEmail(email, name);
  res.status(200).json({
    success: true,
    message: "Sent welcome email successfully",
  });
};

export const refreshAccessToken = (req, res) => {
  const accessToken = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;
  if (!accessToken) {
    return res.status(401).json({ success: false, message: "User must login" })
  }

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = verifyJWTToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const token = generateTokenAndSetCookie(res, decoded.userId);

    res
      .status(200)
      .json({ success: true, message: "Access token refreshed", token });
  } catch (error) {
    console.error("Error in refreshAccessToken:", error);
    res.status(500).json({ success: false, message: "Error in refreshAccessToken" });
   }
};
