const httpStatus = require('http-status');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const knex = require('../config/db');
const ApiError = require('../utils/ApiError');

class User {
  static knexInstance = knex;

  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;

    if (!validator.isEmail(email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email');
    }

    if (password.length < 8) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password must be at least 8 characters long');
    }

    if (!password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password must contain at least one letter and one number');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    const [id] = await this.knexInstance('users').insert({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    return this.findById(id);
  }

  static async findById(id, keepPassword = false) {
    const user = await this.knexInstance('users').where('id', id).first();
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (!keepPassword) {
      delete user.password;
    }
    return user;
  }

  static async findOne({ email }, keepPassword = false) {
    const user = await this.knexInstance('users').where('email', email).first();
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (!keepPassword) {
      delete user.password;
    }
    return user;
  }

  static async update(userId, updateData) {
    const user = await this.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const sanitizedData = { ...updateData };

    if (updateData.email) {
      if (!validator.isEmail(updateData.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email');
      }
      if (await this.isEmailTaken(updateData.email, userId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
      }
      sanitizedData.email = updateData.email.toLowerCase();
    }

    if (updateData.password) {
      if (updateData.password.length < 8) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password must be at least 8 characters long');
      }
      if (!updateData.password.match(/\d/) || !updateData.password.match(/[a-zA-Z]/)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Password must contain at least one letter and one number');
      }
      sanitizedData.password = await bcrypt.hash(updateData.password, 8);
    }

    sanitizedData.updatedAt = this.knexInstance.fn.now();

    await this.knexInstance('users').where('id', userId).update(sanitizedData);

    return this.findById(userId);
  }

  static async deleteById(userId) {
    const user = await this.findById(userId);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const deleted = await this.knexInstance('users').where('id', userId).del();

    if (!deleted) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete user');
    }

    return user;
  }

  static async paginate(filter = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'id:asc' } = options;
    const offset = (page - 1) * limit;

    // Extract sorting field and order
    const [sortField, sortOrder] = sortBy.split(':');

    // Build query
    const query = this.knexInstance('users').where(filter);

    // Get total count
    const [{ count }] = await query.clone().count('* as count');
    const totalCount = parseInt(count, 10);

    // Get paginated results with all fields except password
    const users = await query
      .orderBy(sortField, sortOrder)
      .limit(limit)
      .offset(offset)
      .select(['id', 'name', 'email', 'role', 'isEmailVerified', 'createdAt', 'updatedAt']);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return {
      totalCount,
      totalPages,
      currentPage: page,
      users,
    };
  }

  static async isEmailTaken(email, excludeUserId = 0) {
    const user = await this.knexInstance('users').where('email', email.toLowerCase()).whereNot('id', excludeUserId).first();
    return !!user;
  }
}

module.exports = User;
