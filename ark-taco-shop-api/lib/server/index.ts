"use strict";

import Hapi from "hapi";
import path from "path";

import AppContext from "../AppContext";
import routes from "./routes";

export type ServerOptions = {
  enabled: boolean;
  host: string;
  port: number;
};

export default async config => {
  try {
    const { logger } = AppContext;
    logger.info("INSIDE server");

    debugger;
    const baseConfig = {
      host: config.host,
      port: config.port,
      routes: {
        cors: true,
        validate: {
          async failAction(request, h, err) {
            throw err;
          }
        }
      }
    };

    const server = new Hapi.Server(baseConfig);
    await server.register({ plugin: require("h2o2") });
    await server.register(require("inert"));

    debugger;

    debugger;
    await server.register({
      plugin: routes,
      routes: { prefix: "/api" },
      options: config
    });

    debugger;
    server.route({
      method: "GET",
      path: "/inventory",
      handler: {
        file: {
          path: path.join(__dirname, "public", "inventory.html"),
          confine: false
        }
      }
    });

    debugger;
    server.route({
      method: "GET",
      path: "/public/{param*}",
      handler: {
        directory: {
          path: path.join(__dirname, "public"),
          listing: true,
          index: ["index.html", "default.html"]
        }
      }
    });

    debugger;
    await server.start();

    logger.info(
      `ark-taco-shop-api available and listening on ${server.info.uri}`
    );

    return server;
  } catch (error) {
    debugger;
    throw error;
    // TODO no exit here?
    return process.exit(1);
  }
};
