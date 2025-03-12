const moment = require('moment');
const knex = require('../config/db');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

class MobileOTP {
  static knexInstance = knex;

  static async create(otpData) {
    const { userId, mobileNumber, otp, expiresAt } = otpData;
    
    // Try to find existing OTP record
    const existingOTP = await this.knexInstance('mobileotp')
      .where({ userId, mobileNumber })
      .first();

    if (existingOTP) {
      // Update existing record
      await this.knexInstance('mobileotp')
        .where({ userId, mobileNumber })
        .update({
          otp,
          expiresAt,
          updatedAt: this.knexInstance.fn.now()
        });
      return this.findById(existingOTP.id);
    } else {
      // Create new record
      const [id] = await this.knexInstance('mobileotp').insert({
        userId,
        mobileNumber,
        otp,
        expiresAt,
      });
      return this.findById(id);
    }
  }

  static async findById(id) {
    const otp = await this.knexInstance('mobileotp').where('id', id).first();
    return otp;
  }

  static async findByUserIdAndMobile(userId, mobileNumber) {
    const otp = await this.knexInstance('mobileotp')
      .where({ userId, mobileNumber })
      .first();
    
    return otp;
  }

  static async isValidOTP(userId, mobileNumber, otp) {
    const record = await this.knexInstance('mobileotp')
      .where({
        userId,
        mobileNumber,
        otp,
      })
      .where('expiresAt', '>', this.knexInstance.fn.now())
      .first();
    
    return !!record;
  }
}

module.exports = MobileOTP; 