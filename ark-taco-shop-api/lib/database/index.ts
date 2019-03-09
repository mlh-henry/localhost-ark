"use strict";

import Sequelize from "sequelize";
import Umzug from "umzug";
import path from "path";

import AppContext from "../AppContext";
import { PaginationParams } from "../server/utils";

export interface ProductAttributes {
  id: number;
  code: string;
  description: string;
  imageUrl: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PartialProductAttributes {
  id?: number;
  code?: string;
  description?: string;
  imageUrl?: string;
  name?: string;
  price?: number;
  quantity?: number;
}

function runMigrations(connection) {
  const umzug = new Umzug({
    storage: "sequelize",
    storageOptions: {
      sequelize: connection
    },
    migrations: {
      params: [connection.getQueryInterface(), Sequelize],
      path: path.join(__dirname, "migrations")
    }
  });

  return umzug.up();
}

export type DatabaseOptions = Sequelize.Options;

class Database {
  connection = null;
  logger = null;

  executeMigrations = async () => {
    try {
      await runMigrations(this.connection);
    } catch (error) {
      this.logger.error("Error while running migrations", error);
      // TODO no exit here?
      process.exit(1);
    }
  };

  setUpConnection = async (config: DatabaseOptions) => {
    // There is no need to set up again if connection exists
    if (this.connection) {
      return;
    }

    const sequelizeOptions: Sequelize.Options = {
      ...config,
      ...{ logging: false }
    };
    this.connection = new Sequelize(sequelizeOptions);

    try {
      await this.connection.authenticate();
    } catch (error) {
      this.logger.error("Unable to connect to the database", error);
      // TODO no exit here?
      process.exit(1);
    }
  };

  setUp = async (config: DatabaseOptions) => {
    this.logger = AppContext.logger;

    await this.setUpConnection(config);
    await this.executeMigrations();
  };

  getModels = () => this.connection["import"]("./models");

  paginateProduct = (params: PaginationParams) => {
    const { Product } = this.getModels();
    return Product.findAndCountAll(params);
  };

  findOrCreateProduct = (data, defaults = {}) => {
    const { Product } = this.getModels();
    return Product.findOrCreate({ where: data, defaults });
  };

  findProductById = (id: number) => {
    const { Product } = this.getModels();
    return Product.findByPk(id);
  };

  updateProduct = async (
    id: number,
    data: PartialProductAttributes
  ): Promise<ProductAttributes> => {
    const { Product } = this.getModels();
    const product = await Product.findByPk(id);

    return product.update(data);
  };
}

export default new Database();
