import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Generous for normal campus registration
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registrations submitted from this IP. Please wait a few minutes.',
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'API rate limit exceeded. Please try again shortly.',
  },
});
