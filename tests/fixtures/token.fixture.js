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

const tokenService = require('../../src/services/token.service');

const setupTokenFixture = async (user) => {
  // Generate access token for the provided user
  const tokens = await tokenService.generateAuthTokens(user);
  return tokens.access.token;
};

module.exports = {
  setupTokenFixture,
};
