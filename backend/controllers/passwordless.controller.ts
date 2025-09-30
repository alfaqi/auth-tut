import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.ts";
import { sendMagicRequestEmail } from "../resend/emails.ts";
import {
  generateRefreshTokenAndSetCookie,
  generateTokenAndSetCookie,
} from "../utils/utils.ts";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET as string;

export const magicRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email });
  }

  const token = jwt.sign({ email }, MAGIC_LINK_SECRET, { expiresIn: "10m" });
  sendMagicRequestEmail(email, token);
  //   await sendEmail(email, "Your login link", `Click here: ${link}`);

  res.json({ success: true, message: "Magic link sent!" });
};

export const magicLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.query;

  try {
    const { email } = jwt.verify(token as string, MAGIC_LINK_SECRET) as {
      email: string;
    };
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    // Issue normal access/refresh tokens
    const accessToken = generateTokenAndSetCookie(res, user._id.toString());
    generateRefreshTokenAndSetCookie(res, user._id.toString());

    res.json({ success: true, accessToken });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid or expired link" });
  }
};
