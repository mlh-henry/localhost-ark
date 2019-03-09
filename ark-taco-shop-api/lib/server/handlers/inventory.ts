"use strict";

import { Request, ResponseToolkit } from "hapi";

import database, { ProductAttributes } from "../../database";
import utils from "../utils";
import schema from "../schema";

function getFindOrCreateCallback(
  upsertProduct: ProductAttributes,
  callback: (product: ProductAttributes) => any
) {
  return async function findOrCreateCallback(
    product: ProductAttributes,
    created: boolean
  ) {
    if (!created) {
      var total = product.quantity + upsertProduct.quantity;
      const result = await database.updateProduct(product.id, {
        quantity: total
      });
      callback(result);
    } else {
      callback(product);
    }
  };
}

function getFindOrCreatePromise(upsertProduct: ProductAttributes) {
  return new Promise(resolve => {
    database
      .findOrCreateProduct({ code: upsertProduct.code }, upsertProduct)
      // @ts-ignore
      .spread(getFindOrCreateCallback(upsertProduct, resolve));
  });
}

exports.create = {
  async handler(request: Request, h: ResponseToolkit): Promise<object> {
    const productsToUpsert = <[object?]>request.payload || [];
    const productsPromises = productsToUpsert.map(getFindOrCreatePromise);

    return Promise.all(productsPromises).then(products =>
      h.response(utils.respondWithCollection(products)).code(201)
    );
  },
  options: {
    plugins: {
      pagination: {
        enabled: false
      }
    },
    validate: schema.createInventory
  }
};
