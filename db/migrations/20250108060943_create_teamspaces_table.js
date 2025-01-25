/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('teamspaces', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.integer('team_id').notNullable();
    table.string('role').notNullable().checkIn(['owner', 'member']);
    table.timestamp('joined_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'team_id']);
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('team_id').references('id').inTable('teams').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('teamspaces');
};
