import { rateLimit, Options } from "express-rate-limit";

const createRateLimiter = (options?: Partial<Options>) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again later.",
    headers: true,
    ...options, // allow overrides per route
  });

// Reuse across routes
export const loginRateLimit = createRateLimiter();
export const signupRateLimit = createRateLimiter();
export const forgotPasswordRateLimit = createRateLimiter();
export const resetPasswordRateLimit = createRateLimiter();
export const magicRequestRateLimit = createRateLimiter();
export const requestVerificationCodeRateLimit = createRateLimiter();
export const verifyEmailRateLimit = createRateLimiter();
export const refreshAccessTokenRateLimit = createRateLimiter();
