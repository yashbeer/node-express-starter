const knex = require('knex');
const config = require('./config');
const logger = require('./logger');

const knexInstance = knex({
  client: 'better-sqlite3',
  connection: {
    filename: config.sqlite.path,
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, cb) => {
      try {
        conn.pragma('foreign_keys = ON');
        cb(null, conn);
      } catch (error) {
        cb(error, conn);
      }
    },
  },
});

knexInstance
  .raw('SELECT 1')
  .then(() => {
    logger.info(`Connected to SQLite database ${config.sqlite.path}`);
  })
  .catch((error) => {
    logger.error('Failed to connect to SQLite database:', error);
    process.exit(1);
  });

module.exports = knexInstance;
