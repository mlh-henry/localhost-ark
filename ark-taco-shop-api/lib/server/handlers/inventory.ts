"use strict";

import database from "../../database";
import utils from "../utils";
import schema from "../schema";

function getFindOrCreateCallback(upsertProduct, callback) {
    return function findOrCreateCallback(product, created) {
        if (!created) {
            var total = product.quantity + upsertProduct.quantity;
            // @ts-ignore
            database.updateProduct(product.id, { quantity: total }).then(callback);
        } else {
            callback(product);
        }
    };
}

function getFindOrCreatePromise(upsertProduct) {
    return new Promise(function(resolve, reject) {
        database
            // @ts-ignore
            .findOrCreateProduct({ code: upsertProduct.code }, upsertProduct)
            .spread(getFindOrCreateCallback(upsertProduct, resolve));
    });
}

exports.create = {
    async handler(request, h) {
        const productsToUpsert = request.payload || [];
        const productsPromises = productsToUpsert.map(getFindOrCreatePromise);

        return Promise.all(productsPromises).then(function(products) {
            return h.response(utils.respondWithCollection(request, products, "product")).code(201);
        });
    },
    options: {
        plugins: {
            pagination: {
                enabled: false,
            },
        },
        validate: schema.createInventory,
    },
};
