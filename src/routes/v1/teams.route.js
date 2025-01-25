const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { checkTeamOwner } = require('../../middlewares/teamOwner');
const { teamValidation } = require('../../validations');
const { teamController } = require('../../controllers');
const { invitationValidation } = require('../../validations');
const { invitationController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .get(auth('getTeams'), teamController.getAllTeamsOfUser)
  .post(auth('manageTeams'), validate(teamValidation.createTeam), teamController.createTeam);

router.route('/myinvitation').get(auth('getInvitation'), invitationController.getInvitations);

router
  .route('/myinvitation/:invitationId')
  .put(
    auth('manageInvitation'),
    validate(invitationValidation.deleteInvitationByUser),
    invitationController.updateInvitationByUser
  );

router
  .route('/:teamId')
  .get(auth('getTeams'), validate(teamValidation.getTeamDetails), teamController.getTeamDetails)
  .put(auth('manageTeams'), validate(teamValidation.updateTeam), checkTeamOwner, teamController.updateTeam)
  .delete(auth('manageTeams'), validate(teamValidation.deleteTeam), checkTeamOwner, teamController.deleteTeam);

router
  .route('/:teamId/member')
  .get(auth('getTeamspaces'), validate(teamValidation.getTeamspaceList), teamController.getTeamspaceList)
  .delete(
    auth('manageTeamspaces'),
    validate(teamValidation.deleteTeamspace),
    checkTeamOwner,
    teamController.deleteTeamspace
  );

router
  .route('/:teamId/invitation')
  .post(
    auth('manageInvitation'),
    validate(invitationValidation.createInvitation),
    checkTeamOwner,
    invitationController.createInvitation
  )
  .get(
    auth('getInvitation'),
    validate(invitationValidation.getAllInvitations),
    checkTeamOwner,
    invitationController.getAllInvitations
  );

router
  .route('/:teamId/invitation/:invitationId')
  .delete(
    auth('manageInvitation'),
    validate(invitationValidation.deleteInvitationById),
    checkTeamOwner,
    invitationController.deleteInvitationById
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team and teamspace management and retrieval
 */

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a team
 *     description: Only users with manage teams permission can create teams.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *             properties:
 *               teamName:
 *                 type: string
 *             example:
 *               teamName: Engineering Team
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all teams of current user
 *     description: Get all teams where the current user is a member.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /teams/{teamId}:
 *   get:
 *     summary: Get team details
 *     description: Get details of a specific team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a team
 *     description: Only team owners can update team details.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *             properties:
 *               teamName:
 *                 type: string
 *             example:
 *               teamName: Updated Engineering Team
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a team
 *     description: Only team owners can delete the team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /teams/{teamId}/member:
 *   get:
 *     summary: Get team members
 *     description: Get all members of a team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamMember'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Remove team member
 *     description: Only team owners can remove members from the team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamspaceId
 *             properties:
 *               teamspaceId:
 *                 type: integer
 *             example:
 *               teamspaceId: 1
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /teams/{teamId}/invitation:
 *   post:
 *     summary: Create an invitation
 *     description: Team owners can invite users to their team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [owner, member]
 *                 default: member
 *             example:
 *               email: user100@example.com
 *               role: member
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invitation'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get team invitations
 *     description: Team owners can get all pending invitations for their team.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /teams/{teamId}/invitation/{invitationId}:
 *   delete:
 *     summary: Delete invitation
 *     description: Team owners can delete/cancel pending invitations.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team id
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invitation id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /teams/myinvitation:
 *   get:
 *     summary: Get user's invitations
 *     description: Get all invitations received by the current user.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /teams/myinvitation/{invitationId}:
 *   put:
 *     summary: Update invitation status
 *     description: Accept or reject a team invitation.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invitation id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *             example:
 *               action: accept
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invitation'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         teamName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         teamName: Engineering Team
 *         createdAt: 2024-01-08T14:25:46.000Z
 *         updatedAt: 2024-01-08T14:25:46.000Z
 *
 *     Teamspace:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         teamId:
 *           type: integer
 *         role:
 *           type: string
 *           enum: [owner, member]
 *         joinedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         userId: 1
 *         teamId: 1
 *         role: owner
 *         joinedAt: 2024-01-08T14:25:46.000Z
 *         createdAt: 2024-01-08T14:25:46.000Z
 *         updatedAt: 2024-01-08T14:25:46.000Z
 */
