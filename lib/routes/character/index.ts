/// <reference path="../../skylanders.d.ts" />
import express = require('express');

module.exports = function (app:express.Express) {
  app.get('/character', require('./list'));
  app.get('/character/:id/thumbnail', require('./thumbnail'));
  app.post('/character/:id/own', require('./own'));
};