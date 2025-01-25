const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Team } = require('../../src/models');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { teamOne, teamTwo, insertTeams } = require('../fixtures/team.fixture');
const { setupTokenFixture } = require('../fixtures/token.fixture');

setupTestDB();

describe('Team routes', () => {
  let userOneAccessToken;
  let userTwoAccessToken;

  beforeEach(async () => {
    const users = await insertUsers([userOne, userTwo, admin]);
    const teams = await insertTeams([teamOne, teamTwo]);
    userOne.id = users[0].id;
    userTwo.id = users[1].id;
    admin.id = users[2].id;
    teamOne.id = teams[0].id;
    teamTwo.id = teams[1].id;
    userOneAccessToken = await setupTokenFixture(userOne);
    userTwoAccessToken = await setupTokenFixture(userTwo);
  });

  describe('POST /v1/teams', () => {
    let newTeam;

    beforeEach(() => {
      newTeam = {
        teamName: faker.company.companyName(),
      };
    });

    test('should return 201 and successfully create team if data is ok', async () => {
      const res = await request(app)
        .post('/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTeam)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        teamName: newTeam.teamName,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbTeam = await Team.findById(res.body.id);
      expect(dbTeam).toBeDefined();
      expect(dbTeam).toMatchObject({
        teamName: newTeam.teamName,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/teams').send(newTeam).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if teamName is missing', async () => {
      delete newTeam.teamName;

      await request(app)
        .post('/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTeam)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/teams', () => {
    test('should return 200 and get all teams for the user', async () => {
      const res = await request(app)
        .get('/v1/teams')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toEqual({
        id: expect.anything(),
        teamName: teamOne.teamName,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        joinedAt: expect.anything(),
        role: 'owner',
        userId: userOne.id,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get('/v1/teams').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/teams/:teamId', () => {
    test('should return 200 and the team object if data is ok', async () => {
      const res = await request(app)
        .get(`/v1/teams/${teamOne.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: teamOne.id,
        teamName: teamOne.teamName,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/teams/${teamOne.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if team is not found', async () => {
      await request(app)
        .get(`/v1/teams/${faker.datatype.number()}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PUT /v1/teams/:teamId', () => {
    test('should return 200 and successfully update team if data is ok', async () => {
      const updateBody = {
        teamName: faker.company.companyName(),
      };

      const res = await request(app)
        .put(`/v1/teams/${teamOne.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: teamOne.id,
        teamName: updateBody.teamName,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbTeam = await Team.findById(teamOne.id);
      expect(dbTeam).toBeDefined();
      expect(dbTeam).toMatchObject({
        teamName: updateBody.teamName,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = { teamName: faker.company.companyName() };

      await request(app).put(`/v1/teams/${teamOne.id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is not team owner', async () => {
      const updateBody = { teamName: faker.company.companyName() };

      await request(app)
        .put(`/v1/teams/${teamOne.id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 403 error if team is not found, hence no team owner', async () => {
      const updateBody = { teamName: faker.company.companyName() };

      await request(app)
        .put(`/v1/teams/${faker.datatype.number()}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if teamName is missing', async () => {
      const updateBody = {};

      await request(app)
        .put(`/v1/teams/${teamOne.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/teams/:teamId', () => {
    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/v1/teams/${teamOne.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbTeam = await Team.findById(teamOne.id);
      expect(dbTeam).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/teams/${teamOne.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is not team owner', async () => {
      await request(app)
        .delete(`/v1/teams/${teamOne.id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 403 error if team is not found, hence no team owner', async () => {
      await request(app)
        .delete(`/v1/teams/${faker.datatype.number()}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });
});
