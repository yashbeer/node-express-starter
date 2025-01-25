const { version } = require('../package.json');
const config = require('../src/config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Nodejs Backend API Docs',
    version,
    license: {
      name: 'MIT',
      url: 'https://github.com/yashbeer/node-express-starter',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
