import rateLimit from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});

export const signupRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});

export const forgotPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});

export const resetPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});

export const magicRequestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});

export const requestVerificationCodeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});

export const verifyEmailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});

export const refreshAccessTokenRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`, if exceeded, the user will get a 429 Too Many Requests response
  message: "Too many requests, please try again later.",
  headers: true, // Add the rate limit headers to the response
});
