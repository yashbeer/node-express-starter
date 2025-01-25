const httpStatus = require('http-status');
const { Team } = require('../models');
const ApiError = require('../utils/ApiError');
const userService = require('./user.service');

const createTeam = async (teamBody) => {
  if (teamBody.userId) {
    await userService.getUserById(teamBody.userId);
  }

  const team = await Team.create(teamBody.teamName);
  await Team.createTeamspace({
    userId: teamBody.userId,
    teamId: team.id,
    role: 'owner',
  });

  return team;
};

const getTeamDetails = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  return team;
};

const addMember = async (teamId, userId, role) => {
  const team = await getTeamDetails(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  await userService.getUserById(userId);
  return Team.createTeamspace({
    userId,
    teamId,
    role,
  });
};

const getAllMyTeams = async (userId) => {
  const teams = await Team.findByUserId(userId);
  if (!teams) {
    return [];
  }
  return teams;
};

const updateTeam = async (teamId, teamName) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }

  return Team.update(teamId, teamName);
};

const deleteTeam = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }

  await Team.delete(teamId);
};

const getTeamMembers = async (teamId) => {
  const team = await Team.findTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  return Team.getTeamMembers(teamId);
};

const removeTeamMember = async (teamId, teamspaceId) => {
  const teamspace = await Team.deleteTeamspace(teamId, teamspaceId);
  return teamspace;
};

const getTeamspaceByUserId = async (teamId, userId) => {
  const teamspace = await Team.findTeamspaceByUserId(teamId, userId);
  return teamspace;
};

const getTeamspaceList = async (teamId) => {
  const teamspace = await Team.getTeamspaceList(teamId);
  if (!teamspace) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Users found');
  }
  return teamspace;
};

const deleteTeamspace = async (teamId, ownerId, teamspaceId) => {
  const deletedTeam = await Team.deleteTeamspace(teamId, ownerId, teamspaceId);
  if (!deletedTeam) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teamspace not found or unauthorized to delete');
  }
};

module.exports = {
  createTeam,
  addMember,
  getAllMyTeams,
  getTeamDetails,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  removeTeamMember,
  getTeamspaceByUserId,
  getTeamspaceList,
  deleteTeamspace,
};
