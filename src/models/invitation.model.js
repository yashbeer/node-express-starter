const httpStatus = require('http-status');
const knex = require('../config/db');
const ApiError = require('../utils/ApiError');

class Invitation {
  static knexInstance = knex;

  static async create(invitedByName, email, teamId, teamName, role) {
    try {
      const [id] = await this.knexInstance('invitations').insert({
        teamId,
        teamName,
        email,
        role: role || 'member',
        invitedByName,
        createdAt: this.knexInstance.fn.now(),
        updatedAt: this.knexInstance.fn.now(),
        invitedAt: this.knexInstance.fn.now(),
      });

      return this.findById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User already invited');
      }
      throw error;
    }
  }

  static async findById(invitationId) {
    const [invitation] = await this.knexInstance('invitations').select('*').where('id', Number(invitationId));
    return invitation || null;
  }

  static async findByTeamId(teamId) {
    const query = await this.knexInstance('invitations')
      .select('*')
      .where('teamId', Number(teamId))
      .orderBy('invitedAt', 'asc');

    return query;
  }

  static async findByEmail(userEmail) {
    const invitations = await this.knexInstance('invitations').where('email', userEmail);
    return invitations || [];
  }

  static async deleteById(invitationId) {
    const deletedCount = await this.knexInstance('invitations').where('id', Number(invitationId)).del();
    return deletedCount;
  }
}

module.exports = Invitation;
