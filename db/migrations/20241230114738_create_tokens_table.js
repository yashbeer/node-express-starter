/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tokens', (table) => {
    table.increments('id').primary();
    table.text('token').notNullable();
    table.integer('user_id').notNullable();
    table.foreign('user_id').references('users.id');
    table.enu('type', ['refresh', 'reset_password', 'verify_email']).notNullable();
    table.datetime('expires').notNullable();
    table.boolean('blacklisted').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('tokens');
};
