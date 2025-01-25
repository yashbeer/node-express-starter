const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { teamService } = require('../services');

const createTeam = catchAsync(async (req, res) => {
  const team = await teamService.createTeam({ userId: req.user.id, ...req.body });
  res.status(httpStatus.CREATED).send(team);
});

const getAllTeamsOfUser = catchAsync(async (req, res) => {
  const teams = await teamService.getAllMyTeams(req.user.id);
  res.send(teams);
});

const getTeamDetails = catchAsync(async (req, res) => {
  const team = await teamService.getTeamDetails(req.params.teamId);
  res.send(team);
});

const updateTeam = catchAsync(async (req, res) => {
  const team = await teamService.updateTeam(req.params.teamId, req.body.teamName);
  res.send(team);
});

const deleteTeam = catchAsync(async (req, res) => {
  await teamService.deleteTeam(req.params.teamId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getTeamMembers = catchAsync(async (req, res) => {
  const members = await teamService.getTeamMembers(req.params.teamId);
  res.send(members);
});

const removeTeamMember = catchAsync(async (req, res) => {
  await teamService.removeTeamMember(req.params.teamId, req.body.teamspaceId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getTeamspaceList = catchAsync(async (req, res) => {
  const teamNames = await teamService.getTeamspaceList(req.params.teamId);
  res.send(teamNames);
});

const deleteTeamspace = catchAsync(async (req, res) => {
  await teamService.deleteTeamspace(req.params.teamId, req.user.id, req.body.teamspaceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTeam,
  getAllTeamsOfUser,
  getTeamDetails,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  removeTeamMember,
  getTeamspaceList,
  deleteTeamspace,
};
