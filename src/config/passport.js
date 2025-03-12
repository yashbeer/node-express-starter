const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: CustomStrategy } = require('passport-custom');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('./tokens');
const config = require('./config');
const { authService, userService } = require('../services');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }
    const user = await userService.getUserById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const otpVerify = async (req, done) => {
  try {
    const { mobileNumber, otp } = req.body;

    // Find user by mobile number
    const user = await userService.getUserByMobileNumber(mobileNumber);

    // Verify OTP
    await authService.verifyOTPAndGetUser(user.id, mobileNumber, otp);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
const otpStrategy = new CustomStrategy(otpVerify);

module.exports = {
  jwtStrategy,
  otpStrategy,
};
