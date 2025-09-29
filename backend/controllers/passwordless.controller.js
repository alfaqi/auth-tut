import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendMagicRequestEmail } from "../resend/emails.js";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET;

export const magicRequest = async (req, res) => {
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

export const magicLogin = async (req, res) => {
  const { token } = req.query;

  try {
    const { email } = jwt.verify(token, MAGIC_LINK_SECRET);
    const user = await User.findOne({ email });

    // Issue normal access/refresh tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.json({ success: true, accessToken });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid or expired link" });
  }
};
