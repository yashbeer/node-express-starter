const moment = require('moment');
const bcrypt = require('bcryptjs');
const { MobileOTP } = require('../../src/models');
const { userOne } = require('./user.fixture');
const config = require('../../src/config/config');

const testOTP = '123456';
const hashedTestOTP = async () => bcrypt.hash(testOTP, 8);

const otpOne = {
  id: 1,
  userId: userOne.id,
  mobileNumber: userOne.mobileNumber,
  otp: null, // Will be set to hashed OTP in insertOTPs
  expiresAt: moment().add(config.otp.expirationMinutes, 'minutes').toDate(),
};

const expiredOTP = {
  id: 2,
  userId: userOne.id,
  mobileNumber: userOne.mobileNumber,
  otp: null, // Will be set to hashed OTP in insertOTPs
  expiresAt: moment().subtract(1, 'minutes').toDate(),
};

const insertOTPs = async (otps) => {
  const hashedOTP = await hashedTestOTP();
  const createdOTPs = await Promise.all(
    otps.map((otp) =>
      MobileOTP.create({
        ...otp,
        otp: hashedOTP,
      })
    )
  );
  return createdOTPs;
};

module.exports = {
  testOTP,
  otpOne,
  expiredOTP,
  insertOTPs,
};
