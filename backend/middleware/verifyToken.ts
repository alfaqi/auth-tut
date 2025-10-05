import type { Request, Response, NextFunction } from "express";
import { verifyJWTToken } from "../utils/utils.ts";
import dotenv from "dotenv";
dotenv.config();

interface AuthRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

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
  try {
    // 1. Try from cookie
    let token = req.cookies?.accessToken;

    // 2. If not found, try from Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - no token provided",
      });
      return;
    }

    // 3. Verify JWT
    const decoded = verifyJWTToken(token, JWT_SECRET) as { userId: string };

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
      });
      return;
    }

    // 4. Attach user ID
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
