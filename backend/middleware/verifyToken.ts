import type { Request, Response, NextFunction } from "express";
import { verifyJWTToken } from "../utils/utils.ts";
import dotenv from "dotenv";
dotenv.config();

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Verify token middleware.
 * Verifies the token provided in the cookies.
 * If the token is invalid or missing, returns a 401 Unauthorized response.
 * If the token is valid, sets the req.userId to the decoded user ID and calls the next middleware.
 * If an error occurs during verification, returns a 500 Server Error response.
 */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - no token provided",
    });
    return;
  }

  try {
    const decoded = verifyJWTToken(token, process.env.JWT_SECRET as string);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
      });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Error in verifyToken:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
