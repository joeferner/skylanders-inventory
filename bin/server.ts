/// <reference path="../lib/skylanders.d.ts" />

import express = require('express');
import skylanders = require('skylanders');
var templates = require('../lib/templates');
import flatjsondb = require('../lib/flatjsondb');
import path = require('path');
var bodyParser = require('body-parser');

var dataDirectory = require('../dataDirectory');
var staticDirectory = path.join(__dirname, '../static');

function run(callback:(err:Error)=>any) {
  var app:skylanders.Express = <skylanders.Express>express();
  app.use(bodyParser.urlencoded({extended: true}));
  app.sendInTemplate = function (res:skylanders.Response, data:any) {
    var html = app.templates['main.hbs'](data);
    res.send(html);
  };
  app.db = new flatjsondb.Db(dataDirectory);
  templates.load(function (err, templates) {
    if (err) {
      return callback(err);
    }
    app.templates = templates;

    require('../lib/routes')(app);
    app.use(express.static(staticDirectory));

    var server = app.listen(process.env.PORT || 3000, '127.0.0.1', function () {
      var host = server.address().address;
      var port = server.address().port;

      console.log('listening at http://%s:%s', host, port);
    });
  });
}

run(function (err) {
  if (err) {
    console.error(err);
  }
});