"use strict";

import Wreck from "wreck";
import { Container, Logger } from "@arkecosystem/core-interfaces";

import AppContext, { CoreApiConfig } from "../../AppContext";
import database from "../../database";

const DEFAULT_CORE_API_CONFIG: CoreApiConfig = {
  host: "localhost",
  port: "4003"
};

function getCoreApiUri(path, search) {
  const {
    config: { coreApi: { host, port } = DEFAULT_CORE_API_CONFIG } = {}
  } = AppContext;

  return `http://${host}:${port}${path || ""}${search || ""}`;
}

function getProxyOptions(request) {
  const options = { headers: {}, payload: request.payload };
  options.headers = Object.assign({}, request.headers);
  // @ts-ignore
  delete options.headers.host;
  delete options.headers["content-length"];

  return options;
}

function proxyToTransactionCreation(request) {
  const { logger } = AppContext;

  const { path = "", search = "" } = request.url;
  const uri = getCoreApiUri(path, search);
  const options = getProxyOptions(request);

  logger.info("💻 PROXYING REQUEST");
  logger.info(JSON.stringify({ path, search, uri, options }));

  return Wreck.request(request.method, uri, options);
}

function getOrderFromTransaction(payload = []) {
  // @ts-ignore
  const [transaction = { vendorField: "{}" }] = payload.transactions || [];
  return JSON.parse(transaction.vendorField) || {};
}

/* Intercepts Ark's transactions proxied call to verify if product has balance */
export default {
  handler: async (request, reply) => {
    const { logger } = AppContext;

    try {
      const { productId } = getOrderFromTransaction(request.payload);

      // @ts-ignore
      const product = await database.findProductById(productId);

      /* If there is not enough balance, we don't create a transaction */
      if (!product || !product.quantity) {
        return reply.response({ error: "Product out of stock" }).code(400);
      }

      /* If there is enough balance, we update product's balance and create a transaction */
      await product.update({ quantity: product.quantity - 1 });
      const res = await proxyToTransactionCreation(request);
      return reply
        .response(res)
        .code(res.statusCode)
        .passThrough(true);
    } catch (error) {
      logger.error(error.message);
      return reply.response({ error }).code(400);
    }
  }
};
