/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('invitations', (table) => {
    table.increments('id').primary();
    table.integer('team_id').notNullable();
    table.string('team_name').notNullable();
    table.string('email').notNullable();
    table.string('role').notNullable().checkIn(['owner', 'member']);
    table.string('invited_by_name').notNullable();
    table.timestamp('invited_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['team_id', 'email']);
    table.foreign('team_id').references('id').inTable('teams').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex }
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('Invitation');
};
