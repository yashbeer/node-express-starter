const faker = require('faker');
const { Team } = require('../../src/models');
const { userOne, userTwo } = require('./user.fixture');

const teamOne = {
  id: 1,
  teamName: faker.company.companyName(),
  userId: userOne.id,
};

const teamTwo = {
  id: 2,
  teamName: faker.company.companyName(),
  userId: userTwo.id,
};

const insertTeams = async (teams) => {
  const createdTeams = await Promise.all(
    teams.map(async (team) => {
      const createdTeam = await Team.create(team.teamName);
      await Team.createTeamspace({
        userId: team.userId,
        teamId: createdTeam.id,
        role: 'owner',
      });
      return { ...createdTeam };
    })
  );
  return createdTeams;
};

module.exports = {
  teamOne,
  teamTwo,
  insertTeams,
};
