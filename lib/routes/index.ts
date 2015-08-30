/// <reference path="../../definitions/express/express.d.ts" />
import express = require('express');

module.exports = function (app:express.Express) {
  app.get('/', require('./home'));
  app.get('/list', require('./list'));
};