/// <reference path="../definitions/express/express.d.ts" />
/// <reference path="../lib/flatjsondb.ts" />
/// <reference path="../lib/skylanders.d.ts" />

import express = require('express');
import skylanders = require('skylanders');
var templates = require('../lib/templates');
import flatjsondb = require('../lib/flatjsondb');
import path = require('path');

var dataDirectory = path.join(__dirname, '../data');
var staticDirectory = path.join(__dirname, '../static');

function run(callback:(err:Error)=>any) {
  var app:skylanders.Express = <skylanders.Express>express();
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

    var server = app.listen(3000, function () {
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