const path = require('path');
const knex = require('../../src/config/db');

const setupTestDB = () => {
  beforeAll(async () => {
    await knex.migrate.latest({
      directory: path.join(__dirname, '../../db/migrations'),
    });
  });

  beforeEach(async () => {
    // Get all table names from the database
    const tables = await knex('sqlite_master')
      .where('type', 'table')
      .whereNot('name', 'sqlite_sequence')
      .whereNot('name', 'knex_migrations')
      .whereNot('name', 'knex_migrations_lock')
      .pluck('name');

    // Disable foreign key checks before truncation
    await knex.raw('PRAGMA foreign_keys = OFF');

    // Truncate all tables in parallel
    await Promise.all(tables.map((table) => knex(table).truncate()));

    // Re-enable foreign key checks after truncation
    await knex.raw('PRAGMA foreign_keys = ON');
  });

  afterAll(async () => {
    await knex.destroy();
  });

  return knex;
};

module.exports = setupTestDB;
