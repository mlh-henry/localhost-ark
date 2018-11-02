'use strict'

const database = require('../../database')
const utils = require('../utils')
const schema = require('../schema')

function getFindOrCreateCallback (upsertProduct, callback) {
  return function findOrCreateCallback (product, created) {
    if (!created) {
      var total = product.quantity + upsertProduct.quantity;
      database.updateProduct(product.id, {quantity: total}).then(callback)
    } else {
      callback(product);
    }
  }
}

function getFindOrCreatePromise (upsertProduct) {
  return new Promise(function (resolve, reject) {
    database.findOrCreateProduct(
      { code: upsertProduct.code }, upsertProduct
    ).spread(getFindOrCreateCallback(upsertProduct, resolve))
  });
}

exports.create = {
  async handler (request, h) {
    const productsToUpsert = request.payload || [];
    const productsPromises = productsToUpsert.map(getFindOrCreatePromise)

    return Promise.all(productsPromises).then(function (products) {
      return h.response(utils.respondWithCollection(request, products, 'product')).code(201)
    });
  },
  options: {
    plugins: {
      pagination: {
        enabled: false
      }
    },
    validate: schema.createInventory
  }
}
