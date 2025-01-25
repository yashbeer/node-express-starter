const Joi = require('joi');

const createInvitation = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    role: Joi.string().valid('owner', 'member').default('member'),
  }),
};

const getAllInvitations = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
  }),
};

const deleteInvitationById = {
  params: Joi.object().keys({
    teamId: Joi.number().integer().required(),
    invitationId: Joi.number().integer().required(),
  }),
};

const deleteInvitationByUser = {
  params: Joi.object().keys({
    invitationId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    action: Joi.string().required().valid('accept', 'reject'),
  }),
};

module.exports = {
  createInvitation,
  getAllInvitations,
  deleteInvitationById,
  deleteInvitationByUser,
};
