const httpStatus = require('http-status');
const { Team } = require('../models');
const ApiError = require('../utils/ApiError');

const checkTeamOwner = async (req, res, next) => {
  try {
    const isOwner = await Team.knexInstance('teamspaces')
      .where({
        teamId: Number(req.params.teamId),
        userId: Number(req.user.id),
        role: 'owner',
      })
      .first();

    if (!isOwner) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'You must be the team owner to perform this action'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkTeamOwner,
};
