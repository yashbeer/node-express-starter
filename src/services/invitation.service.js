const httpStatus = require('http-status');
const { Invitation } = require('../models');
const userService = require('./user.service');
const teamService = require('./team.service');
const ApiError = require('../utils/ApiError');

const createInvitation = async (invitedByName, emailToInvite, teamId, role = 'member') => {
  const user = await userService.getUserByEmail(emailToInvite).catch(() => null);
  if (user) {
    const teamspace = await teamService.getTeamspaceByUserId(teamId, user.id);
    if (teamspace) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User already in team');
    }
  }

  const teamDetails = await teamService.getTeamDetails(teamId);
  const invitation = await Invitation.create(invitedByName, emailToInvite, teamId, teamDetails.teamName, role);
  return invitation;
};

const getAllInvitations = async (teamId) => {
  const invitations = await Invitation.findByTeamId(teamId);
  if (!invitations) {
    return [];
  }
  return invitations;
};

const deleteInvitationById = async (invitationId) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invitation not found');
  }
  await Invitation.deleteById(invitationId);
};

const getInvitationsOfUser = async (userEmail) => {
  const invitations = await Invitation.findByEmail(userEmail);
  if (!invitations || invitations.length === 0) {
    return [];
  }
  return invitations;
};

const updateInvitationByUser = async (invitationId, userEmail, userId, action) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invitation not found');
  }
  if (invitation.email !== userEmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user email');
  }
  if (action === 'accept') {
    const teamspace = await teamService.addMember(invitation.teamId, userId, 'member');
    await Invitation.deleteById(invitationId);
    return teamspace;
    // eslint-disable-next-line no-else-return
  }
  if (action === 'reject') {
    await Invitation.deleteById(invitationId);
    return true;
  }
};

module.exports = {
  createInvitation,
  getAllInvitations,
  deleteInvitationById,
  getInvitationsOfUser,
  updateInvitationByUser,
};
