const { Invitation } = require('../../src/models');
const { userOne, userTwo, userThree } = require('./user.fixture');
const { teamOne } = require('./team.fixture');

const invitationOne = {
  id: 1,
  teamId: teamOne.id,
  teamName: teamOne.teamName,
  email: userTwo.email,
  role: 'member',
  invitedByName: userOne.name,
  invitedAt: new Date(),
};

const invitationTwo = {
  id: 2,
  teamId: teamOne.id,
  teamName: teamOne.teamName,
  email: userThree.email,
  role: 'member',
  invitedByName: userOne.name,
  invitedAt: new Date(),
};

const insertInvitations = async (invitations) => {
  const createdInvitations = await Promise.all(
    invitations.map((invitation) =>
      Invitation.create(invitation.invitedByName, invitation.email, invitation.teamId, invitation.teamName, invitation.role)
    )
  );
  return createdInvitations;
};

module.exports = {
  invitationOne,
  invitationTwo,
  insertInvitations,
};
