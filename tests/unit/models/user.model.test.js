const faker = require('faker');
const path = require('path');
const knex = require('../../../src/config/db');
const User = require('../../../src/models/user.model');

describe('User model', () => {
  beforeAll(async () => {
    // Run migrations
    await knex.migrate.latest({
      directory: path.join(__dirname, '../../../db/migrations'),
    });
  });

  afterAll(async () => {
    // Clean up database
    await knex.destroy();
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await knex('users').truncate();
  });

  describe('User validation', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
    });

    test('should correctly create a valid user', async () => {
      const user = await User.create(newUser);
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(newUser.email);
      expect(user.name).toBe(newUser.name);
      expect(user.role).toBe(newUser.role);
      expect(user).not.toHaveProperty('password');
    });

    test('should throw a validation error if email is invalid', async () => {
      newUser.email = 'invalidEmail';
      await expect(User.create(newUser)).rejects.toThrow('Invalid email');
    });

    test('should throw a validation error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';
      await expect(User.create(newUser)).rejects.toThrow('Password must be at least 8 characters long');
    });

    test('should throw a validation error if password does not contain numbers', async () => {
      newUser.password = 'password';
      await expect(User.create(newUser)).rejects.toThrow('Password must contain at least one letter and one number');
    });

    test('should throw a validation error if password does not contain letters', async () => {
      newUser.password = '11111111';
      await expect(User.create(newUser)).rejects.toThrow('Password must contain at least one letter and one number');
    });
  });

  describe('User queries', () => {
    let user;
    beforeEach(async () => {
      const userData = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
      user = await User.create(userData);
    });

    test('should find user by id', async () => {
      const foundUser = await User.findById(user.id);
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
    });

    test('should find user by email', async () => {
      const foundUser = await User.findOne({ email: user.email });
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(user.email);
    });

    test('should update user', async () => {
      const newName = faker.name.findName();
      const updatedUser = await User.update(user.id, { name: newName });
      expect(updatedUser.name).toBe(newName);
    });

    test('should delete user', async () => {
      await User.deleteById(user.id);
      await expect(User.findById(user.id)).rejects.toThrow('User not found');
    });

    test('should check if email is taken', async () => {
      expect(await User.isEmailTaken(user.email)).toBe(true);
      expect(await User.isEmailTaken(faker.internet.email())).toBe(false);
    });
  });

  describe('User pagination', () => {
    beforeEach(async () => {
      // Clean up tables before each test
      await knex('users').truncate();

      // Create multiple users for pagination testing
      const users = Array(15)
        .fill()
        .map(() => ({
          name: faker.name.findName(),
          email: faker.internet.email().toLowerCase(),
          password: 'password1',
          role: 'user',
        }));
      await Promise.all(users.map((user) => User.create(user)));
    });

    test('should paginate users', async () => {
      const { users, totalPages, totalCount, currentPage } = await User.paginate({}, { limit: 10, page: 1 });
      expect(users).toHaveLength(10);
      expect(totalPages).toBe(2);
      expect(totalCount).toBe(15);
      expect(currentPage).toBe(1);
    });
  });
});
