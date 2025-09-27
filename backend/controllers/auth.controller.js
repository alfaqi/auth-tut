import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  generateExpiryDate,
  generateTokenAndSetCookie,
  generateVerificationCode,
} from "../utils/utils.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

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
          verificationCode: undefined,
          verificationCodeExpiresAt: undefined,
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
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  res.send("Login route controller");
};

export const logout = async (req, res) => {
  res.send("Logout route controller");
};
