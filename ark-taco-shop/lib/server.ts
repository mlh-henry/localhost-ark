import createError from "http-errors";
import express, { Errback, Request, Response, NextFunction } from "express";
import * as path from "path";
import proxy from "http-proxy-middleware";

import buildTacoApiClient, {
  TacoApiOptions
} from "./services/buildTacoApiClient";

function buildApp(tacoApiConfig: TacoApiOptions) {
  var app = express();

  /*
   * Proxy calls to ark-taco-shop-api
   * PS: This needs to be set before other middlewares that modify the request
   */
  const target = tacoApiConfig.uri;
  app.use("/api/taco", proxy({ target, changeOrigin: true }));

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.post("/api/orders", async function(req: Request, res: Response) {
    try {
      const tacoApiClient = buildTacoApiClient(tacoApiConfig);
      const transaction = await tacoApiClient.postTransaction(req.body);
      res.json({ data: transaction });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders", async function(req: Request, res: Response) {
    try {
      const tacoApiClient = buildTacoApiClient(tacoApiConfig);
      const results = await tacoApiClient.listTransactions();
      res.json({ results: results });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/orders", function(req: Request, res: Response) {
    res.sendFile(path.join(__dirname, "..", "/public/orders.html"));
  });

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "..", "/public/index.html"));
  });

  // catch 404 and forward to error handler
  app.use(function(req: Request, res: Response, next: NextFunction) {
    next(createError(404));
  });

  // error handler
  app.use(function(err: any, req: Request, res: Response, next) {
    console.error(err.message);

    // render the error page
    res.status(err.status || 500);
    res.send("Internal Server Error!");
  });

  return app;
}

export default buildApp;
export { TacoApiOptions } from "./services/buildTacoApiClient";
