'use strict';

const Hapi = require('hapi');
var path = require('path');
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
  await server.register(require('inert'));

  try {
    await server.register({
      plugin: require('./routes'),
      routes: { prefix: '/api' },
      options: config
    });

    server.route({
      method: 'GET',
      path: '/inventory',
      handler: {
        file: {
          path: path.join(__dirname, 'public', 'inventory.html'),
          confine: false
        }
      }
    });

    server.route({
      method: 'GET',
      path: '/public/{param*}',
      handler: {
        directory: {
          path: path.join(__dirname, 'public'),
          listing: true,
          index: ['index.html', 'default.html']
        }
      }
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
