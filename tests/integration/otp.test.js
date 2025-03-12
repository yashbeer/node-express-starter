const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User, MobileOTP } = require('../../src/models');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const config = require('../../src/config/config');

setupTestDB();

describe('OTP routes', () => {
  let newUser;

  beforeEach(async () => {
    newUser = {
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password1',
      role: 'user',
      mobileNumber: '9876543210',
    };
  });

  describe('POST /v1/auth/send-otp', () => {
    test('should return 200 and successfully send OTP for new user', async () => {
      const res = await request(app)
        .post('/v1/auth/send-otp')
        .send({ mobileNumber: newUser.mobileNumber })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        code: httpStatus.OK,
        message: 'OTP sent successfully',
        data: {
          userId: expect.anything(),
          expiresAt: expect.anything(),
        },
      });

      // Verify OTP record was created
      const user = await User.findById(res.body.data.userId);
      expect(user).toBeDefined();
      expect(user.mobileNumber).toBe(newUser.mobileNumber);

      const otpRecord = await MobileOTP.findByUserIdAndMobile(user.id, newUser.mobileNumber);
      expect(otpRecord).toBeDefined();
      expect(otpRecord.expiresAt).toBeDefined();
    });

    test('should return 200 and successfully send OTP for existing user', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/auth/send-otp')
        .send({ mobileNumber: userOne.mobileNumber })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        code: httpStatus.OK,
        message: 'OTP sent successfully',
        data: {
          userId: userOne.id,
          expiresAt: expect.anything(),
        },
      });

      const otpRecord = await MobileOTP.findByUserIdAndMobile(userOne.id, userOne.mobileNumber);
      expect(otpRecord).toBeDefined();
      expect(otpRecord.expiresAt).toBeDefined();
    });

    test('should return 400 error if mobile number is invalid', async () => {
      await request(app)
        .post('/v1/auth/send-otp')
        .send({ mobileNumber: 'invalid' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 429 error if OTP requests exceed rate limit', async () => {
      // Make 6 OTP requests (rate limit is 5 per hour)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/v1/auth/send-otp')
          .send({ mobileNumber: newUser.mobileNumber })
          .expect(httpStatus.OK);
      }

      await request(app)
        .post('/v1/auth/send-otp')
        .send({ mobileNumber: newUser.mobileNumber })
        .expect(httpStatus.TOO_MANY_REQUESTS);
    });

    test('should return 429 error if within cooldown period', async () => {
      // Send first OTP
      await request(app)
        .post('/v1/auth/send-otp')
        .send({ mobileNumber: newUser.mobileNumber })
        .expect(httpStatus.OK);

      // Try sending another OTP immediately
      const res = await request(app)
        .post('/v1/auth/send-otp')
        .send({ mobileNumber: newUser.mobileNumber })
        .expect(httpStatus.TOO_MANY_REQUESTS);

      expect(res.body.message).toBe(`Please wait ${config.otp.cooldownMinutes} minutes before requesting another OTP`);
    });
  });

  describe('POST /v1/auth/verify-otp', () => {
    let otpRecord;
    const testOTP = '123456';

    beforeEach(async () => {
      // Create user and OTP record
      const user = await User.create(newUser);
      const hashedOTP = await bcrypt.hash(testOTP, 8);
      otpRecord = await MobileOTP.create({
        userId: user.id,
        mobileNumber: newUser.mobileNumber,
        otp: hashedOTP,
        expiresAt: moment().add(config.otp.expirationMinutes, 'minutes').toDate(),
      });
    });

    test('should return 200 and successfully verify OTP', async () => {
      const res = await request(app)
        .post('/v1/auth/verify-otp')
        .send({
          mobileNumber: newUser.mobileNumber,
          otp: testOTP,
        })
        .expect(httpStatus.OK);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.mobileNumber).toBe(newUser.mobileNumber);
      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 401 error if OTP is invalid', async () => {
      await request(app)
        .post('/v1/auth/verify-otp')
        .send({
          mobileNumber: newUser.mobileNumber,
          otp: '999999',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if OTP is expired', async () => {
      // Update OTP record to be expired
      await MobileOTP.create({
        userId: otpRecord.userId,
        mobileNumber: newUser.mobileNumber,
        otp: otpRecord.otp,
        expiresAt: moment().subtract(1, 'minutes').toDate(),
      });

      await request(app)
        .post('/v1/auth/verify-otp')
        .send({
          mobileNumber: newUser.mobileNumber,
          otp: testOTP,
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if mobile number is not found', async () => {
      await request(app)
        .post('/v1/auth/verify-otp')
        .send({
          mobileNumber: '9999999999',
          otp: testOTP,
        })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if OTP format is invalid', async () => {
      await request(app)
        .post('/v1/auth/verify-otp')
        .send({
          mobileNumber: newUser.mobileNumber,
          otp: '12345', // Less than 6 digits
        })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/verify-otp')
        .send({
          mobileNumber: newUser.mobileNumber,
          otp: '1234567', // More than 6 digits
        })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/verify-otp')
        .send({
          mobileNumber: newUser.mobileNumber,
          otp: 'abcdef', // Non-numeric
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });
}); 