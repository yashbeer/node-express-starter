const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 OTP requests per hour
  message: {
    code: 429,
    message: 'Too many OTP requests. Please try again later.',
  },
});

module.exports = {
  authLimiter,
  otpLimiter,
};
