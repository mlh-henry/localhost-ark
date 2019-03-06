"use strict";

import { Container, Logger } from "@arkecosystem/core-interfaces";

import AppContext from "../AppContext";
const productsHandlers = require("./handlers/products");
const inventoryHandlers = require("./handlers/inventory");
import transactionsHandler from "./handlers/transactions";

const DEFAULT_CORE_API_CONFIG = { host: "localhost", port: "4003" };

const register = async server => {
  var { config: { coreApi = DEFAULT_CORE_API_CONFIG } = {} } = AppContext;

  server.route([
    {
      method: "GET",
      path: "/taco/products",
      ...productsHandlers.index
    },
    {
      method: "POST",
      path: "/taco/inventory",
      ...inventoryHandlers.create
    },
    {
      method: "POST",
      // transaction's creation needs to be intercepted
      path: "/transactions",
      ...transactionsHandler
    },
    {
      method: "*",
      // all the other calls to the core-api can be proxied directly
      path: "/{path*}",
      handler: {
        proxy: {
          protocol: "http",
          host: coreApi.host,
          port: coreApi.port,
          passThrough: true
        }
      }
    }
  ]);
};

export default {
  name: "inventory-api",
  version: "0.1.0",
  register
};
