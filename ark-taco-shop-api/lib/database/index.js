'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Umzug = require('umzug');
const path = require('path');
const logger = require('@arkecosystem/core-container').resolvePlugin('logger');

function runMigrations (connection) {
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: connection
    },
    migrations: {
      params: [connection.getQueryInterface(), Sequelize],
      path: path.join(__dirname, 'migrations')
    }
  });

  return umzug.up()
}

function registerModels (connection) {
  const { Product } = this.connection['import']('./models');

  this.product = Product;
}

class Database {
  async setUp (config) {
    if (this.connection) {
      throw new Error('Inventory-API database already initialised');
    }

    this.connection = new Sequelize({
      ...config,
      ...{ operatorsAliases: Op, logging: false }
    });

    try {
      await this.connection.authenticate();
      await runMigrations(this.connection);
      await registerModels.bind(this)(this.connection);
    } catch (error) {
      logger.error('Unable to connect to the database', error);
      // TODO no exit here?
      process.exit(1);
    }
  }

  paginateProduct (params) {
    return this.product.findAndCountAll(params);
  }

  findOrCreateProduct (data, defaults = {}) {
    return this.product.findOrCreate({ where: data, defaults });
  }

  findProductById (id) {
    return this.product.findById(id)
  }

  async updateProduct (id, data) {
    const product = await this.product.findById(id);

    return product.update(data);
  }
}

module.exports = new Database();
