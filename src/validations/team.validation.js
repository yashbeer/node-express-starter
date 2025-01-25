const Joi = require('joi');

const createTeam = {
  body: Joi.object().keys({
    teamName: Joi.string().required(),
  }),
};

const getTeamDetails = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
  }),
};

const updateTeam = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      teamName: Joi.string().required(),
    })
    .required(),
};

const deleteTeam = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
  }),
};

const getTeamspaceList = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
  }),
};

const deleteTeamspace = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    teamspaceId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createTeam,
  getTeamDetails,
  updateTeam,
  deleteTeam,
  getTeamspaceList,
  deleteTeamspace,
};
