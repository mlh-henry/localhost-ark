'use strict';

const Hapi = require('hapi');
const logger = require('@arkecosystem/core-container').resolvePlugin('logger');

module.exports = async config => {
  const baseConfig = {
    host: config.host,
    port: config.port,
    routes: {
      cors: true,
      validate: {
        async failAction (request, h, err) {
          throw err;
        }
      }
    }
  };

  const server = new Hapi.Server(baseConfig);
  await server.register({ plugin: require('h2o2') });

  try {
    await server.register({
      plugin: require('./routes'),
      routes: { prefix: '/api' },
      options: config
    });

    await server.start();

    logger.info(`ark-taco-shop-api available and listening on ${server.info.uri}`);

    return server;
  } catch (error) {
    logger.error(error.stack);
    // TODO no exit here?
    process.exit(1);
  }
};
