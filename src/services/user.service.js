const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  return User.paginate(filter, options);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @param {boolean} [keepPassword=false] - Whether to keep the password field
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email, keepPassword = false) => {
  return User.findOne({ email }, keepPassword);
};

/**
 * Get user by mobile number
 * @param {string} mobileNumber
 * @returns {Promise<User>}
 */
const getUserByMobileNumber = async (mobileNumber) => {
  const user = await User.findByMobileNumber(mobileNumber);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  return User.update(userId, updateBody);
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  return User.deleteById(userId);
};

const isPasswordMatch = async (user, password) => {
  return bcrypt.compare(password, user.password);
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  getUserByMobileNumber,
  updateUserById,
  deleteUserById,
  isPasswordMatch,
};
