"use strict";

import Wreck from "wreck";
import { Request, ResponseToolkit } from "hapi";

import AppContext from "../../AppContext";
import database from "../../database";
import { RequestOptions } from "../../types/wreck";

function getCoreApiUri(path: string, search: string): string {
  const {
    config: {
      coreApi: { host, port }
    }
  } = AppContext;

  return `http://${host}:${port}${path || ""}${search || ""}`;
}

function getProxyOptions(request: Request): RequestOptions {
  const options = { headers: {}, payload: request.payload };
  options.headers = Object.assign({}, request.headers);

  delete options.headers["host"];
  delete options.headers["content-length"];

  return options;
}

function proxyToTransactionCreation(request: Request): Promise<any> {
  const { logger } = AppContext;

  // @ts-ignore
  const { path = "", search = "" } = request.url;
  const uri = getCoreApiUri(path, search);
  const options = getProxyOptions(request);

  logger.debug(
    `💻 PROXYING REQUEST ${JSON.stringify({ path, search, uri, options })}`
  );

  return Wreck.request(request.method, uri, options);
}

function getOrderFromTransaction(payload: [object?] = []) {
  // @ts-ignore
  const [transaction = { vendorField: "{}" }] = payload.transactions || [];
  return JSON.parse(transaction.vendorField) || {};
}

/* Intercepts Ark's transactions proxied call to verify if product has balance */
export default {
  handler: async (request: Request, h: ResponseToolkit): Promise<object> => {
    const { logger } = AppContext;

    try {
      const { productId } = getOrderFromTransaction(<[object?]>request.payload);

      const product = await database.findProductById(productId);

      /* If there is not enough balance, we don't create a transaction */
      if (!product || !product.quantity) {
        return h.response({ error: "Product out of stock" }).code(400);
      }

      /* If there is enough balance, we update product's balance and create a transaction */
      await product.update({ quantity: product.quantity - 1 });
      const res = await proxyToTransactionCreation(request);
      return (
        h
          .response(res)
          .code(res.statusCode)
          // @ts-ignore
          .passThrough(true)
      );
    } catch (error) {
      logger.error(error.message);
      return h.response({ error }).code(400);
    }
  }
};
