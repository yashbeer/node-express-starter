const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const sendOTP = {
  body: Joi.object().keys({
    mobileNumber: Joi.string()
      .required()
      .pattern(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': 'Mobile number must be a 10-digit number',
      }),
  }),
};

const verifyOTP = {
  body: Joi.object().keys({
    mobileNumber: Joi.string()
      .required()
      .pattern(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': 'Mobile number must be a 10-digit number',
      }),
    otp: Joi.string()
      .required()
      .pattern(/^[0-9]{6}$/)
      .messages({
        'string.pattern.base': 'OTP must be a 6-digit number',
      }),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOTP,
  verifyOTP,
};
