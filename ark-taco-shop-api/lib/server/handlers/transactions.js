'use strict';

const Wreck = require('wreck');

const database = require('../../database')
const container = require('@arkecosystem/core-container')

const logger = container.resolvePlugin('logger');

function getCoreApiUri (path, search) {
  const coreApi = container.resolveOptions('api');
  return `http://${coreApi.host}:${coreApi.port}${path || ''}${search || ''}`;
}

function getProxyOptions (request) {
  const options = { headers: {}, payload: request.payload };
  options.headers = Object.assign({}, request.headers);
  delete options.headers.host;
  delete options.headers['content-length'];

  return options;
}

function proxyToTransactionCreation (request) {
  const { path = '', search = '' } = request.url;
  const uri = getCoreApiUri(path, search);
  const options = getProxyOptions(request);

  return Wreck.request(request.method, uri, options);
}

function getOrderFromTransaction (payload = []) {
  const [
    transaction = { vendorField: '{}' }
  ] = (payload.transactions || []);
  return JSON.parse(transaction.vendorField) || {};
}

/* Intercepts Ark's transactions proxied call to verify if product has balance */
exports.create = {
  async handler (request, reply) {
    try {
      const { productId } = getOrderFromTransaction(request.payload);
      const product = await database.findProductById(productId);

      /* If there is not enough balance, we don't create a transaction */
      if (!product || !product.quantity) {
        return reply.response({ error: 'Product out of stock' }).code(400);
      }

      /* If there is enough balance, we update product's balance and create a transaction */
      await product.update({ quantity: product.quantity - 1 });
      const res = await proxyToTransactionCreation(request);
      return reply.response(res).code(res.statusCode).passThrough(true);
    } catch (error) {
      logger.error(error.message);
      return reply.response({ error }).code(400);
    }
  }
};
