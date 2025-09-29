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
 * Generates a JSON Web Token (JWT) representing the user's access token.
 * The token is signed with the JWT_SECRET environment variable and expires
 * in the given number of minutes.
 * @param {string} userId The user's ID.
 * @param {string} [expiresIn=15m] The number of minutes until the token expires.
 * @returns {string} The access token.
 */
export const generateAccessToken = (userId, expiresIn = "15m") => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

/**
 * Generates a refresh token as a string.
 * The token is a JSON Web Token (JWT) signed with the JWT_REFRESH_SECRET environment variable.
 * The token contains the user's ID and expires in the given number of minutes.
 * @param {string} userId The user's ID.
 * @param {string} [expiresIn=7d] The number of minutes until the token expires.
 * @returns {string} The refresh token.
 */
export const generateRefreshToken = (userId, expiresIn = "7d") => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: expiresIn,
  });
};

export const generateTokenAndSetCookie = (res, userId, expiresIn) => {
  const token = generateAccessToken(userId, expiresIn);

  res.cookie("token", token, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // in dev we use HTTP, but in production we use HTTPS, turn off the https on dev env
    sameSite: "strict", // Prevents an attack called CSRF
    maxAge: 15 * 60 * 1000, // 7 days
  });

  return token;
};

export const generateRefreshTokenAndSetCookie = (res, userId, expiresIn) => {
  const refreshToken = generateRefreshToken(userId, expiresIn);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // in dev we use HTTP, but in production we use HTTPS, turn off the https on dev env
    sameSite: "strict", // Prevents an attack called CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return refreshToken;
};

/**
 * Verifies a JSON Web Token (JWT) with the given secret.
 * @param {string} token The JWT to verify.
 * @param {string} secret The secret to use for verification.
 * @returns {Promise<object>} The decoded token if verification is successful.
 * @throws {Error} If the token is invalid or has expired.
 */
export const verifyJWTToken = (token, secret) => {
  return jwt.verify(token, secret);
}