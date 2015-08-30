/// <reference path="../definitions/express/express.d.ts" />

import express = require('express');
var app:express.Express = express();

require('../lib/routes')(app);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
});
