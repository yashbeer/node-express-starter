const httpStatus = require('http-status');
const knex = require('../config/db');
const ApiError = require('../utils/ApiError');
const dateformatter = require('../utils/dateformatter');

class Token {
  static knexInstance = knex;

  static async findOne(query) {
    const queryBuilder = this.knexInstance('tokens');

    if (query.token) {
      queryBuilder.where('token', query.token);
    }
    if (query.user) {
      queryBuilder.where('userId', query.user);
    }
    if (query.type) {
      queryBuilder.where('type', query.type);
    }
    if (query.blacklisted !== undefined) {
      queryBuilder.where('blacklisted', query.blacklisted ? 1 : 0);
    }

    const result = await queryBuilder.first();
    if (!result) return null;

    return {
      ...result,
      blacklisted: !!result.blacklisted,
    };
  }

  static async countDocuments(query) {
    const queryBuilder = this.knexInstance('tokens');

    if (query.user) {
      queryBuilder.where('userId', query.user);
    }
    if (query.type) {
      queryBuilder.where('type', query.type);
    }

    const [{ count }] = await queryBuilder.count('* as count');
    return parseInt(count, 10);
  }

  static async create(data) {
    // Validate token type
    const validTypes = ['refresh', 'reset_password', 'verify_email'];
    if (!validTypes.includes(data.type)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid token type. Must be one of: ${validTypes.join(', ')}`);
    }

    const [id] = await this.knexInstance('tokens').insert({
      token: data.token,
      userId: data.user,
      type: data.type,
      expires: dateformatter(data.expires),
      blacklisted: data.blacklisted ? 1 : 0,
      createdAt: this.knexInstance.fn.now(),
      updatedAt: this.knexInstance.fn.now(),
    });

    return {
      id,
      token: data.token,
      userId: data.user,
      type: data.type,
      expires: data.expires,
      blacklisted: !!data.blacklisted,
    };
  }

  static async deleteMany(query) {
    const queryBuilder = this.knexInstance('tokens');

    if (query.user) {
      queryBuilder.where('userId', query.user);
    }
    if (query.type) {
      queryBuilder.where('type', query.type);
    }

    return queryBuilder.del();
  }
}

module.exports = Token;
