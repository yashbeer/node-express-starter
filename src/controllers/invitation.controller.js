const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { invitationService } = require('../services');

const createInvitation = catchAsync(async (req, res) => {
  const invitation = await invitationService.createInvitation(
    req.user.name,
    req.body.email,
    req.params.teamId,
    req.body.role
  );
  res.status(httpStatus.CREATED).send(invitation);
});

const getAllInvitations = catchAsync(async (req, res) => {
  const invitations = await invitationService.getAllInvitations(req.params.teamId);
  res.send(invitations);
});

const deleteInvitationById = catchAsync(async (req, res) => {
  await invitationService.deleteInvitationById(req.params.invitationId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getInvitations = catchAsync(async (req, res) => {
  const invitations = await invitationService.getInvitationsOfUser(req.user.email);
  res.send(invitations);
});

const updateInvitationByUser = catchAsync(async (req, res) => {
  const invitation = await invitationService.updateInvitationByUser(
    req.params.invitationId,
    req.user.email,
    req.user.id,
    req.body.action
  );
  res.send(invitation);
});

module.exports = {
  createInvitation,
  getAllInvitations,
  deleteInvitationById,
  getInvitations,
  updateInvitationByUser,
};
