'use strict'

const database = require('./database')

exports.plugin = {
  pkg: require('../package.json'),
  defaults: require('./defaults'),
  alias: 'ark-taco-shop-api',
  async register (container, options) {
    const logger = container.resolvePlugin('logger')

    try {
      if (!options.enabled) {
        logger.info('ark-taco-shop-api is disabled :grey_exclamation:')
        return
      }

      await database.setUp(options.database)

      if (options.server.enabled) {
        return require('./server')(options.server)
      }

      logger.info('ark-taco-shop-api server is disabled :grey_exclamation:')
    } catch (error) {
      logger.error(error)
      process.exit(1)
    }
  },
  async deregister (container, options) {
    if (options.server.enabled) {
      container.resolvePlugin('logger').info('Stopping ark-taco-shop-api')

      return container.resolvePlugin('ark-taco-shop-api').stop()
    }
  }
}
