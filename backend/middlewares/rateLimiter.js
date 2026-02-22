import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests. Try again in 15 minutes.' },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

export const sosLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: { success: false, message: 'SOS rate limit reached. Please wait.' },
});
