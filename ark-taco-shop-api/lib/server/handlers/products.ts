"use strict";

import { Request } from "hapi";

import database from "../../database";
import utils from "../utils";

exports.index = {
  async handler(request: Request) {
    const products = await database.paginateProduct(utils.paginate(request));

    return utils.toPagination(products);
  }
};
