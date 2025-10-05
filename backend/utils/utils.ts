import jwt from "jsonwebtoken";
import type { Response } from "express";

/**
 * Generates a 6-digit code using a random number between 100000 and 999999.
 * @returns {string} A 6-digit code as a string.
 */
export const generateCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Generates a Date object representing the current time plus the given number of minutes.
 * This function is useful for generating expiration dates for tokens, etc.
 * @param {number} [minutes=60] The number of minutes to add to the current time.
 * @returns {Date} The expiration date.
 */
export const generateExpiryDate = (minutes: number = 60): Date =>
  new Date(Date.now() + minutes * 60 * 1000);

/**
 * Generates a JSON Web Token (JWT) representing the user's access token.
 * The token is signed with the JWT_SECRET environment variable and expires
 * in the given number of minutes.
 * @param {string} userId The user's ID.
 * @param {string} [expiresIn=15m] The number of minutes until the token expires.
 * @returns {string} The access token.
 */
export const generateAccessToken = (
  userId: string,
  expiresIn: string = "15m"
): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    {
      expiresIn: expiresIn,
    } as jwt.SignOptions
  );
};

/**
 * Generates a refresh token as a string.
 * The token is a JSON Web Token (JWT) signed with the JWT_REFRESH_SECRET environment variable.
 * The token contains the user's ID and expires in the given number of minutes.
 * @param {string} userId The user's ID.
 * @param {string} [expiresIn=7d] The number of minutes until the token expires.
 * @returns {string} The refresh token.
 */
export const generateRefreshToken = (
  userId: string,
  expiresIn: string = "7d"
): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: expiresIn,
    } as jwt.SignOptions
  );
};

/**
 * Generates an access token and sets it as a cookie on the response.
 * The access token is a JSON Web Token (JWT) signed with the JWT_SECRET environment variable.
 * The token contains the user's ID and expires in the given number of minutes.
 * The cookie is set with the following options:
 * - httpOnly: true (prevents XSS attacks)
 * - secure: true (in production) or false (in development)
 * - sameSite: "strict" (prevents CSRF attacks)
 * - maxAge: 15 minutes
 * @param {Response} res - The response object.
 * @param {string} userId - The user's ID.
 * @param {string} [expiresIn=15m] - The number of minutes until the token expires.
 * @returns {string} The access token.
 */
export const generateTokenAndSetCookie = (
  res: Response,
  userId: string,
  expiresIn?: string
): string => {
  const accessToken = generateAccessToken(userId, expiresIn);

  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // in dev we use HTTP, but in production we use HTTPS, turn off the https on dev env
    sameSite: "strict", // Prevents an attack called CSRF
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  return accessToken;
};

/**
 * Generates a refresh token and sets it as a cookie on the response.
 * The refresh token is a JSON Web Token (JWT) signed with the JWT_REFRESH_SECRET environment variable.
 * The token contains the user's ID and expires in the given number of minutes.
 * The cookie is set with the following options:
 * - httpOnly: true (prevents XSS attacks)
 * - secure: true (in production) or false (in development)
 * - sameSite: "strict" (prevents CSRF attacks)
 * - maxAge: 7 days
 * @returns {string} The refresh token.
 */
export const generateRefreshTokenAndSetCookie = (
  res: Response,
  userId: string,
  expiresIn?: string
): string => {
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
 * Verifies a JSON Web Token (JWT) by checking if it is valid and not expired.
 * Returns null instead of throwing on any error (invalid token, expired, bad inputs, etc.).
 * @param {string} token The JWT to verify.
 * @param {string} secret The secret to use for verification.
 * @param {jwt.VerifyOptions} [options] Optional options for verification.
 * @returns {any | null} The decoded JWT payload if valid; otherwise null.
 */
export const verifyJWTToken = (
  token: string,
  secret: string,
  options?: jwt.VerifyOptions
): any | null => {
  // Basic input validation
  if (!token || typeof token !== "string") {
    return null;
  }
  if (!secret || typeof secret !== "string") {
    return null;
  }

  try {
    return jwt.verify(token, secret, options);
  } catch (_error) {
    // Swallow verification errors and return null for robustness
    return null;
  }
};
