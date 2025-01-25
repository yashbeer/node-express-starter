const allRoles = {
  user: [
    'getUsers',
    'manageUsers',
    'manageTeams',
    'getTeams',
    'getTeamspaces',
    'manageTeamspaces',
    'manageInvitation',
    'getInvitation',
  ],
  admin: ['getUsers', 'manageUsers', 'getWhatsappAccounts', 'manageWhatsappAccounts'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
