const knex = require('../config/db');

class Team {
  static knexInstance = knex;

  static async create(teamName) {
    const [id] = await this.knexInstance('teams').insert({
      teamName,
      createdAt: this.knexInstance.fn.now(),
      updatedAt: this.knexInstance.fn.now(),
    });
    return this.findById(id);
  }

  static async findById(teamId) {
    const [team] = await this.knexInstance('teams').select('*').where('id', Number(teamId));
    return team || null;
  }

  static async findByUserId(userId) {
    const query = await this.knexInstance('teamspaces')
      .select('teams.*', 'teamspaces.role', 'teamspaces.userId', 'teamspaces.joinedAt')
      .join('teams', 'teams.id', '=', 'teamspaces.teamId')
      .where('teamspaces.userId', Number(userId))
      .orderBy('teams.createdAt', 'asc');

    return query;
  }

  static async update(teamId, teamName) {
    await this.knexInstance('teams').where('id', Number(teamId)).update({
      teamName,
      updatedAt: this.knexInstance.fn.now(),
    });

    return this.findById(teamId);
  }

  static async delete(teamId) {
    // Delete all teamspaces first due to foreign key constraint
    await this.knexInstance('teamspaces').where('teamId', Number(teamId)).del();

    return this.knexInstance('teams').where('id', Number(teamId)).del();
  }

  static async createTeamspace(teamBody) {
    const [id] = await this.knexInstance('teamspaces').insert({
      userId: teamBody.userId,
      teamId: teamBody.teamId,
      role: teamBody.role,
      createdAt: this.knexInstance.fn.now(),
      updatedAt: this.knexInstance.fn.now(),
      joinedAt: this.knexInstance.fn.now(),
    });
    return this.findTeamspaceById(id);
  }

  static async findTeamspaceById(id) {
    const [teamspace] = await this.knexInstance('teamspaces').where('id', Number(id));
    return teamspace;
  }

  static async findTeamspaceByUserId(teamId, userId) {
    const [teamspace] = await this.knexInstance('teamspaces')
      .where('userId', Number(userId))
      .where('teamId', Number(teamId));
    return teamspace;
  }

  static async getTeamspaceList(teamId) {
    return this.knexInstance('teamspaces')
      .join('users', 'teamspaces.userId', 'users.id')
      .select(
        'teamspaces.id',
        'teamspaces.userId',
        'teamspaces.teamId',
        'teamspaces.role',
        'teamspaces.joinedAt',
        'users.name',
        'users.email'
      )
      .where('teamspaces.teamId', Number(teamId));
  }

  static async deleteTeamspace(teamspaceId) {
    return this.knexInstance('teamspaces').where('id', Number(teamspaceId)).del();
  }
}

module.exports = Team;
