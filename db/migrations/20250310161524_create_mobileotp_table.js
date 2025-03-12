/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mobileotp', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('mobile_number', 15).notNullable();
    table.string('otp', 6).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Unique constraint to ensure one-to-one relationship
    table.unique(['user_id', 'mobile_number']);

    // Indexes
    table.index('expires_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mobileotp');
};
