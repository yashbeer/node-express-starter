const httpStatus = require('http-status');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const tokenService = require('./token.service');
const userService = require('./user.service');
const { Token, MobileOTP } = require('../models');
const { tokenTypes } = require('../config/tokens');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email, true);

  if (!user || !(await userService.isPasswordMatch(user, password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  delete user.password;
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: 0 });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  }
  await Token.delete({ token: refreshToken });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await Token.delete(refreshTokenDoc);
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Generate a random 6-digit OTP
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to mobile number
 * @param {string} mobileNumber
 * @param {string} otp
 * @returns {Promise<void>}
 */
const sendOTPSMS = async (mobileNumber, otp) => {
  if (config.env === 'development') {
    // eslint-disable-next-line no-console
    console.log(`OTP sent to ${mobileNumber}: ${otp}`);
  } else {
    // TODO: Implement SMS sending logic for production
    // Provider: Msg91, Twilio, etc.
  }
};

/**
 * Find OTP record by user ID and mobile number
 * @param {number} userId
 * @param {string} mobileNumber
 * @returns {Promise<MobileOTP>}
 */
const findOTPByUserIdAndMobile = async (userId, mobileNumber) => {
  return MobileOTP.findByUserIdAndMobile(userId, mobileNumber);
};

/**
 * Create new OTP record
 * @param {Object} otpData
 * @returns {Promise<MobileOTP>}
 */
const createOTPRecord = async (otpData) => {
  return MobileOTP.create(otpData);
};

/**
 * Check if user is within OTP cooldown period
 * @param {number} userId
 * @param {string} mobileNumber
 * @returns {Promise<void>}
 */
const checkOTPCooldownPeriod = async (userId, mobileNumber) => {
  const existingOTP = await findOTPByUserIdAndMobile(userId, mobileNumber);
  if (!existingOTP) {
    return; // No existing OTP, so no cooldown needed
  }

  const cooldownEndsAt = moment.utc(existingOTP.updatedAt).add(config.otp.cooldownMinutes, 'minutes');
  const currentTimestamp = moment.utc();

  if (currentTimestamp.isBefore(cooldownEndsAt)) {
    const secondsRemaining = Math.ceil(cooldownEndsAt.diff(currentTimestamp, 'seconds', true));
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      `Please wait ${secondsRemaining} second${secondsRemaining === 1 ? '' : 's'} before requesting another OTP`
    );
  }
};

/**
 * Create and send OTP for authentication
 * @param {string} mobileNumber
 * @returns {Promise<Object>}
 */
const createOTPForAuth = async (mobileNumber) => {
  // Check for existing OTP and enforce cooldown period
  let user;
  try {
    user = await userService.getUserByMobileNumber(mobileNumber);
  } catch (error) {
    if (error.statusCode === httpStatus.NOT_FOUND) {
      // If user doesn't exist, create a new one
      const randomName = `user.${Math.random().toString(36).substring(2, 8)}`;
      const randomPassword = Math.random().toString(36).substring(2, 15);
      user = await userService.createUser({
        name: randomName,
        email: `${randomName}@temp.com`,
        password: randomPassword,
        mobileNumber,
      });
    } else {
      throw error;
    }
  }

  // Check cooldown period
  await checkOTPCooldownPeriod(user.id, mobileNumber);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otp, 8);

  // Create or update OTP record
  const otpRecord = await createOTPRecord({
    userId: user.id,
    mobileNumber,
    otp: hashedOTP,
    expiresAt: moment().add(config.otp.expirationMinutes, 'minutes').toDate(),
  });

  // Send OTP via SMS
  await sendOTPSMS(mobileNumber, otp);

  return {
    userId: user.id,
    expiresAt: otpRecord.expiresAt,
  };
};

/**
 * Verify OTP
 * @param {number} userId
 * @param {string} mobileNumber
 * @param {string} otp
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (userId, mobileNumber, otp) => {
  const otpRecord = await findOTPByUserIdAndMobile(userId, mobileNumber);
  if (!otpRecord) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP not found');
  }

  if (moment().isAfter(otpRecord.expiresAt)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP has expired');
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otp);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
  }

  return true;
};

/**
 * Verify OTP and get user
 * @param {number} userId
 * @param {string} mobileNumber
 * @param {string} otp
 * @returns {Promise<User>}
 */
const verifyOTPAndGetUser = async (userId, mobileNumber, otp) => {
  await verifyOTP(userId, mobileNumber, otp);
  return userService.getUserById(userId);
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  generateOTP,
  sendOTPSMS,
  createOTPForAuth,
  verifyOTPAndGetUser,
};
