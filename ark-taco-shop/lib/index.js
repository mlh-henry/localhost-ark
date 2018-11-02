'use strict';

const http = require('http');

exports.plugin = {
  pkg: require('../package.json'),
  defaults: require('./defaults'),
  alias: 'ark-taco-shop',
  async register (container, options) {
    const logger = container.resolvePlugin('logger');
    const config = options.inventoryApi;
    const app = require('./server')(config);

    function onListening () {
      var addr = server.address();
      var bind =
        typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
      logger.info(`ark-taco-shop-api available and listening on ${bind}`);
    }

    try {
      if (!options.enabled) {
        if (!options.inventoryApi.sender) {
          throw new Error(
            'It is necessary to establish the value of the environment variable "ARK_CLIENT_EXAMPLE_SENDER" to an address'
          );
        }
        if (!options.inventoryApi.passphrase) {
          throw new Error(
            'It is necessary to establish the value of the environment variable "ARK_CLIENT_EXAMPLE_PASS" to the passphrase of the "ARK_CLIENT_EXAMPLE_SENDER" address'
          );
        }

        logger.info('ark-taco-shop is disabled :grey_exclamation:');
        return;
      }

      if (options.server.enabled) {
        var port = options.server.port;
        app.set('port', port);

        var server = http.createServer(app);

        server.listen(port);
        server.on('listening', onListening);
        return;
      }

      logger.info('ark-taco-shop server is disabled :grey_exclamation:');
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  },

  async deregister (container, options) {
    if (options.enabled) {
      container.resolvePlugin('logger').info('Stopping ark-taco-shop');
      const plugin = container.resolvePlugin('ark-taco-shop');

      if (plugin) {
        return plugin.stop();
      }
    }
  }
};
