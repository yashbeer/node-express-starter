/**
 * Token test fixtures for use with Knex/SQLite.
 *
 * Usage:
 * const { setupTokenFixture } = require('../fixtures/token.fixture');
 *
 * // In your test:
 * const { userOneAccessToken, adminAccessToken, userOneId, adminId } = await setupTokenFixture();
 *
 * Note: This fixture automatically creates the necessary users and returns both
 * the tokens and the user IDs. You must await the setup
 * function to get the actual database-generated IDs and tokens.
 */

const moment = require('moment');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const tokenService = require('../../src/services/token.service');
const { userOne, admin, insertUsers } = require('./user.fixture');

let userOneId;
let adminId;

const setupTokenFixture = async () => {
  // Insert users and get their IDs
  const [createdUserOne, createdAdmin] = await insertUsers([userOne, admin]);
  userOneId = createdUserOne.id;
  adminId = createdAdmin.id;

  // Generate access tokens
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const userOneAccessToken = tokenService.generateToken(userOneId, accessTokenExpires, tokenTypes.ACCESS);
  const adminAccessToken = tokenService.generateToken(adminId, accessTokenExpires, tokenTypes.ACCESS);

  return {
    userOneAccessToken,
    adminAccessToken,
    userOneId,
    adminId,
  };
};

module.exports = {
  setupTokenFixture,
};
