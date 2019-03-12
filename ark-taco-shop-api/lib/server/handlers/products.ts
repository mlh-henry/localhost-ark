"use strict";

import { Request } from "hapi";

import database from "../../database";
import utils, { PaginatedResults } from "../utils";
import { ProductInstance } from "../../database/models/product";

exports.index = {
  async handler(request: Request): Promise<PaginatedResults<ProductInstance>> {
    const { Product } = database;
    const products = await Product.findAndCountAll(utils.paginate(request));

    return utils.toPagination(products);
  }
};
