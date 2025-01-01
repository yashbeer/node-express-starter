const faker = require('faker');
const path = require('path');
const knex = require('../../../src/config/db');
const Token = require('../../../src/models/token.model');
const User = require('../../../src/models/user.model');

describe('Token model', () => {
  let user;

  beforeAll(async () => {
    // Run migrations
    await knex.migrate.latest({
      directory: path.join(__dirname, '../../../db/migrations'),
    });
  });

  afterAll(async () => {
    // Clean up database and close connection
    await knex('tokens').truncate();
    await knex('users').truncate();
    await knex.destroy();
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await knex('tokens').truncate();
    await knex('users').truncate();

    // Create a test user
    user = await User.create({
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password1',
      role: 'user',
    });
  });

  describe('Token creation', () => {
    test('should correctly create a token', async () => {
      const tokenData = {
        token: faker.datatype.uuid(),
        user: user.id,
        type: 'refresh',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        blacklisted: false,
      };

      const token = await Token.create(tokenData);
      expect(token).toHaveProperty('id');
      expect(token.token).toBe(tokenData.token);
      expect(token.userId).toBe(tokenData.user);
      expect(token.type).toBe(tokenData.type);
      expect(token.blacklisted).toBe(tokenData.blacklisted);
    });

    test('should throw error for invalid token type', async () => {
      const tokenData = {
        token: faker.datatype.uuid(),
        user: user.id,
        type: 'invalid_type',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        blacklisted: false,
      };

      await expect(Token.create(tokenData)).rejects.toThrow('Invalid token type');
    });
  });

  describe('Token queries', () => {
    let token;
    beforeEach(async () => {
      token = await Token.create({
        token: faker.datatype.uuid(),
        user: user.id,
        type: 'refresh',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        blacklisted: false,
      });
    });

    test('should find token by token string', async () => {
      const foundToken = await Token.findOne({ token: token.token });
      expect(foundToken).toBeDefined();
      expect(foundToken.token).toBe(token.token);
    });

    test('should find token by user id', async () => {
      const foundToken = await Token.findOne({ user: user.id });
      expect(foundToken).toBeDefined();
      expect(foundToken.userId).toBe(user.id);
    });

    test('should find token by type', async () => {
      const foundToken = await Token.findOne({ type: 'refresh' });
      expect(foundToken).toBeDefined();
      expect(foundToken.type).toBe('refresh');
    });

    test('should find token by blacklist status', async () => {
      const foundToken = await Token.findOne({ blacklisted: false });
      expect(foundToken).toBeDefined();
      expect(foundToken.blacklisted).toBe(false);
    });

    test('should return null for non-existent token', async () => {
      const foundToken = await Token.findOne({ token: 'nonexistent' });
      expect(foundToken).toBeNull();
    });
  });

  describe('Token deletion', () => {
    beforeEach(async () => {
      // Create multiple tokens for the user
      await Promise.all([
        Token.create({
          token: faker.datatype.uuid(),
          user: user.id,
          type: 'refresh',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          blacklisted: false,
        }),
        Token.create({
          token: faker.datatype.uuid(),
          user: user.id,
          type: 'verify_email',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          blacklisted: false,
        }),
      ]);
    });

    test('should delete tokens by user id', async () => {
      const deletedCount = await Token.deleteMany({ user: user.id });
      expect(deletedCount).toBe(2);
      const remainingTokens = await knex('tokens').where({ userId: user.id }).count('* as count').first();
      expect(remainingTokens.count).toBe(0);
    });

    test('should delete tokens by type', async () => {
      const deletedCount = await Token.deleteMany({ type: 'refresh' });
      expect(deletedCount).toBe(1);
      const remainingTokens = await knex('tokens').where({ type: 'refresh' }).count('* as count').first();
      expect(remainingTokens.count).toBe(0);
    });
  });

  describe('Token counting', () => {
    beforeEach(async () => {
      // Create multiple tokens for the user
      await Promise.all([
        Token.create({
          token: faker.datatype.uuid(),
          user: user.id,
          type: 'refresh',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          blacklisted: false,
        }),
        Token.create({
          token: faker.datatype.uuid(),
          user: user.id,
          type: 'verify_email',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          blacklisted: false,
        }),
      ]);
    });

    test('should count tokens by user id', async () => {
      const result = await knex('tokens').where({ userId: user.id }).count('* as count').first();
      expect(result.count).toBe(2);
    });

    test('should count tokens by type', async () => {
      const result = await knex('tokens').where({ type: 'refresh' }).count('* as count').first();
      expect(result.count).toBe(1);
    });
  });
});
