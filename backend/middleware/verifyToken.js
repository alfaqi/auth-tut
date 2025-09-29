import { verifyJWTToken } from "../utils/utils.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Verify token middleware.
 * Verifies the token provided in the cookies.
 * If the token is invalid or missing, returns a 401 Unauthorized response.
 * If the token is valid, sets the req.userId to the decoded user ID and calls the next middleware.
 * If an error occurs during verification, returns a 500 Server Error response.
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - no token provided",
    });
  }

  try {
    const decoded = verifyJWTToken(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
      });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Error in verifyToken:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
