var createError = require('http-errors');
var express = require('express');
var path = require('path');
var proxy = require('http-proxy-middleware');

var buildTacoApiClient = require('./services/buildTacoApiClient');

function buildApp (tacoApiConfig) {
  var app = express();

  /*
  * Proxy calls to ark-taco-shop-api
  * PS: This needs to be set before other middlewares that modify the request
  */
  const target = tacoApiConfig.uri;
  app.use('/api/taco', proxy({ target, changeOrigin: true }));

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/api/orders', async function (req, res, next) {
    try {
      const tacoApiClient = buildTacoApiClient(tacoApiConfig);
      const transaction = await tacoApiClient.postTransaction(req.body)
      res.json({ data: transaction });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.use('/inventory', function (req, res) {
    res.sendFile(path.join(__dirname, '..', '/public/inventory.html'));
  });

  app.use('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', '/public/index.html'));
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    console.error(err.message);

    // render the error page
    res.status(err.status || 500);
    res.text('Internal Server Error!');
  });

  return app;
}

module.exports = buildApp;
