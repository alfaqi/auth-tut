import jwt from "jsonwebtoken";

/**
 * Generates a verification code as a string.
 * The code is a random number between 100000 and 999999.
 * @returns {string} The verification code.
 */
export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Generates an expiry date object from the current time.
 * The expiry date is calculated by adding the specified number of minutes
 * to the current time. If no number of minutes is specified, the expiry
 * date defaults to an hour from the current time.
 * @param {number} [minutes=60] The number of minutes to add to the current time.
 * @returns {number} The expiry date object from the current time.
 */
export const generateExpiryDate = (minutes = 60) =>
  Date.now() + minutes * 60 * 1000;

export const generateResetPasswordToken = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // in dev we use HTTP, but in production we use HTTPS, turn off the https on dev env
    sameSite: "strict", // Prevents an attack called CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
