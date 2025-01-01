const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const knex = require('../src/config/db');

// Use the database path from your config
const dbPath = path.resolve(__dirname, '../', knex.client.config.connection.filename);
const db = new Database(dbPath);

function formatSql(sql) {
  // Add line breaks and indentation for better readability
  return sql
    .replace(/\(/, '(\n  ') // Add line break after the first opening parenthesis
    .replace(/\)$/, '\n)') // Add line break before the last closing parenthesis
    .replace(/\s*,\s*/g, ',\n  ') // Add line breaks after commas
    .replace(/PRIMARY KEY/g, '\n  PRIMARY KEY') // Indentation for primary key
    .replace(/FOREIGN KEY/g, '\n  FOREIGN KEY'); // Indentation for foreign key
}

async function dumpSchema() {
  try {
    // Get all table names using Knex
    const tables = await knex('sqlite_master').select('name').where('type', 'table').whereNot('name', 'like', 'sqlite_%');

    // Use map to process tables
    const schemaContent = tables
      .map((table) => {
        const stmt = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table.name);
        const formattedSql = formatSql(stmt.sql);
        return `${formattedSql}\n\n`; // Add two newlines after each table
      })
      .join('');

    // Ensure db directory exists
    const dbDir = path.join(__dirname, '..', 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Write schema to file
    fs.writeFileSync(path.join(dbDir, 'schema.dump.md'), schemaContent);

    console.log('Schema dumped successfully to db/schema.dump.md'); // eslint-disable-line no-console
  } catch (error) {
    console.error('Error dumping schema:', error); // eslint-disable-line no-console
    process.exit(1);
  } finally {
    await knex.destroy();
    db.close();
  }
}

dumpSchema();
