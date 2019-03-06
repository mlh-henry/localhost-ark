import { Logger } from "@arkecosystem/core-interfaces";

export type CoreApiConfig = {
  host: string;
  port: string;
};

export type AppContextConfig = {
  coreApi: CoreApiConfig;
};

export type AppContext = {
  logger: Logger.ILogger;
  config: AppContextConfig;
};

const logger: Logger.ILogger = {
  make: () => {
    return this;
  },
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  verbose: console.log,
  suppressConsoleOutput: (suppress: boolean) => {}
};

const AppContext: AppContext = {
  logger,
  config: {
    coreApi: {
      host: "0.0.0.0",
      port: "4003"
    }
  }
};

export default AppContext;
