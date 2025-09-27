import jwt from "jsonwebtoken";

/**
 * Generates a verification code as a string.
 * The code is a random number between 100000 and 999999.
 * @returns {string} The verification code.
 */
export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Generates a Date object representing the current time plus the given number of minutes.
 * This function is useful for generating expiration dates for tokens, etc.
 * @param {number} [minutes=60] The number of minutes to add to the current time.
 * @returns {Date} The expiration date.
 */
export const generateExpiryDate = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000);

/**
 * Generates a reset password token as a string.
 * The token is a random number between 100000 and 999999.
 * @returns {string} The reset password token.
 */
export const generateResetPasswordToken = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Generates a JSON Web Token (JWT) and sets it as a cookie on the response.
 * The token is signed with the JWT_SECRET environment variable and expires in 7 days.
 * The cookie is set with the following options:
 *   - httpOnly: true (to prevent XSS attacks)
 *   - secure: true (only on production environment, to use HTTPS)
 *   - sameSite: "strict" (to prevent CSRF attacks)
 *   - maxAge: 7 days (the duration of the cookie)
 * @param {Response} res The response object to set the cookie on.
 * @param {string} userId The user ID to sign the token with.
 * @returns {string} The generated token.
 */
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
