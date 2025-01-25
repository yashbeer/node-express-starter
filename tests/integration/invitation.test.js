const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Invitation } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { teamOne, teamTwo, insertTeams } = require('../fixtures/team.fixture');
const { invitationOne, insertInvitations } = require('../fixtures/invitation.fixture');
const { setupTokenFixture } = require('../fixtures/token.fixture');
const teamService = require('../../src/services/team.service');

setupTestDB();

describe('Team Invitation routes', () => {
  let userOneAccessToken;
  let userTwoAccessToken;

  beforeEach(async () => {
    const users = await insertUsers([userOne, userTwo]);
    const teams = await insertTeams([teamOne, teamTwo]);
    const invitations = await insertInvitations([invitationOne]);

    userOne.id = users[0].id;
    userTwo.id = users[1].id;
    teamOne.id = teams[0].id;
    teamTwo.id = teams[1].id;
    invitationOne.id = invitations[0].id;
    userOneAccessToken = await setupTokenFixture(userOne);
    userTwoAccessToken = await setupTokenFixture(userTwo);
  });

  describe('POST /v1/teams/:teamId/invitation - validation tests', () => {
    let newInvitation;

    beforeEach(() => {
      newInvitation = {
        email: faker.internet.email(),
        role: 'member',
      };
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post(`/v1/teams/${teamOne.id}/invitation`).send(newInvitation).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is not team owner', async () => {
      await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(newInvitation)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if email is invalid', async () => {
      newInvitation.email = 'invalid-email';
      await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newInvitation)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if role is invalid', async () => {
      newInvitation.role = 'invalid-role';
      await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newInvitation)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/teams/:teamId/invitation - success scenarios', () => {
    const newInvitation = {
      email: faker.internet.email().toLowerCase(),
      role: 'member',
    };

    test('should return 201 and successfully create invitation if data is ok', async () => {
      const res = await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newInvitation)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        teamId: teamOne.id,
        teamName: teamOne.teamName,
        email: newInvitation.email,
        role: newInvitation.role,
        invitedByName: userOne.name,
        invitedAt: expect.anything(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbInvitation = await Invitation.findById(res.body.id);
      expect(dbInvitation).toBeDefined();
      expect(dbInvitation).toMatchObject({
        teamId: teamOne.id,
        teamName: teamOne.teamName,
        email: newInvitation.email,
        role: newInvitation.role,
        invitedByName: userOne.name,
      });
    });

    test('should successfully create invitation for existing user not in team', async () => {
      // First delete the existing invitation
      await Invitation.deleteById(invitationOne.id);

      const inviteData = {
        email: userTwo.email,
        role: 'member',
      };
      const res = await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(inviteData)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(userTwo.email);
      expect(res.body.teamId).toBe(teamOne.id);
    });

    test('should return 400 if inviting user already in team', async () => {
      // First add userTwo to the team
      await teamService.addMember(teamOne.id, userTwo.id, 'member');

      const inviteData = {
        email: userTwo.email,
        role: 'member',
      };

      await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(inviteData)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/teams/:teamId/invitation', () => {
    test('should return 200 and get all invitations for the team', async () => {
      const res = await request(app)
        .get(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toEqual({
        id: invitationOne.id,
        teamId: teamOne.id,
        teamName: teamOne.teamName,
        email: invitationOne.email,
        role: invitationOne.role,
        invitedByName: expect.anything(),
        invitedAt: expect.anything(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/teams/${teamOne.id}/invitation`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is not team owner', async () => {
      await request(app)
        .get(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /v1/teams/myinvitation', () => {
    test('should return 200 and get all invitations for the user', async () => {
      const res = await request(app)
        .get('/v1/teams/myinvitation')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toEqual({
        id: expect.anything(),
        teamId: expect.anything(),
        teamName: expect.anything(),
        email: userTwo.email,
        role: 'member',
        invitedByName: expect.anything(),
        invitedAt: expect.anything(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get('/v1/teams/myinvitation').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PUT /v1/teams/myinvitation/:invitationId', () => {
    test('should return 200 and successfully update invitation status if accepting', async () => {
      const updateBody = {
        action: 'accept',
      };

      const res = await request(app)
        .put(`/v1/teams/myinvitation/${invitationOne.id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: expect.anything(),
        teamId: teamOne.id,
        userId: userTwo.id,
        role: invitationOne.role,
        joinedAt: expect.anything(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbInvitation = await Invitation.findById(invitationOne.id);
      expect(dbInvitation).toBeNull();
    });

    test('should return 200 and successfully update invitation status if rejecting', async () => {
      const updateBody = {
        action: 'reject',
      };

      const res = await request(app)
        .put(`/v1/teams/myinvitation/${invitationOne.id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toBe(true);
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = { action: 'accept' };
      await request(app).put(`/v1/teams/myinvitation/${invitationOne.id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if status is invalid', async () => {
      const updateBody = { action: 'invalid-status' };
      await request(app)
        .put(`/v1/teams/myinvitation/${invitationOne.id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if invitation not found', async () => {
      const updateBody = { action: 'accept' };
      await request(app)
        .put(`/v1/teams/myinvitation/${faker.datatype.number()}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/teams/:teamId/invitation/:invitationId', () => {
    test('should return 204 and successfully delete invitation', async () => {
      await request(app)
        .delete(`/v1/teams/${teamOne.id}/invitation/${invitationOne.id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbInvitation = await Invitation.findById(invitationOne.id);
      expect(dbInvitation).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .delete(`/v1/teams/${teamOne.id}/invitation/${invitationOne.id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is not team owner', async () => {
      await request(app)
        .delete(`/v1/teams/${teamOne.id}/invitation/${invitationOne.id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 error if invitation not found', async () => {
      await request(app)
        .delete(`/v1/teams/${teamOne.id}/invitation/${faker.datatype.number()}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/teams/:teamId/invitation - create new invitation', () => {
    test('should return 201 and successfully create invitation if data is ok', async () => {
      const newInvitation = {
        email: faker.internet.email().toLowerCase(),
        role: 'member',
      };

      const res = await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newInvitation)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        teamId: teamOne.id,
        teamName: teamOne.teamName,
        email: newInvitation.email,
        role: newInvitation.role,
        invitedByName: expect.any(String),
        invitedAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    test('should return 400 error if role is invalid', async () => {
      const newInvitation = {
        email: faker.internet.email().toLowerCase(),
        role: 'invalid-role',
      };

      await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newInvitation)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should default to member role if role is not provided', async () => {
      const newInvitation = {
        email: faker.internet.email().toLowerCase(),
      };

      const res = await request(app)
        .post(`/v1/teams/${teamOne.id}/invitation`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newInvitation)
        .expect(httpStatus.CREATED);

      expect(res.body.role).toBe('member');
    });
  });
});
