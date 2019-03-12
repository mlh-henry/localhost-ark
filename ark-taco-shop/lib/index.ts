"use strict";

import * as http from "http";
import Server, { TacoApiOptions } from "./server";
import { Logger, Container } from "@arkecosystem/core-interfaces";

interface ServerOptions {
  enabled: boolean;
  host: string;
  port: number;
}

interface Options {
  enabled: boolean;
  inventoryApi: TacoApiOptions;
  server: ServerOptions;
}

export const plugin = {
  pkg: require("../package.json"),
  defaults: require("./defaults"),
  alias: "ark-taco-shop",
  async register(container: Container.IContainer, options: Options) {
    const logger = container.resolvePlugin<Logger.ILogger>("logger");
    const config = options.inventoryApi;
    const app = Server(config);

    function onListening() {
      var addr = server.address();
      var bind =
        typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
      logger.info(`🌮 ark-taco-shop available and listening on ${bind}`);
    }

    try {
      if (!options.enabled) {
        if (!options.inventoryApi.sender) {
          throw new Error(
            'It is necessary to establish the value of the environment variable "ARK_CLIENT_EXAMPLE_SENDER" to an address'
          );
        }
        if (!options.inventoryApi.passphrase) {
          throw new Error(
            'It is necessary to establish the value of the environment variable "ARK_CLIENT_EXAMPLE_PASS" to the passphrase of the "ARK_CLIENT_EXAMPLE_SENDER" address'
          );
        }

        logger.info("🌮 ark-taco-shop is disabled :grey_exclamation:");
        return;
      }

      if (options.server.enabled) {
        const port = options.server.port;
        app.set("port", port);

        var server = http.createServer(app);

        server.listen(port);
        server.on("listening", onListening);
        return;
      }

      logger.info("🌮 ark-taco-shop server is disabled :grey_exclamation:");
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  },

  async deregister(container: Container.IContainer, options: Options) {
    if (options.enabled) {
      container.resolvePlugin("logger").info("🌮 Stopping ark-taco-shop");
      const plugin = container.resolvePlugin("ark-taco-shop");

      if (plugin) {
        return plugin.stop();
      }
    }
  }
};
