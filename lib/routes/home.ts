/// <reference path="../../definitions/express/express.d.ts" />
import express = require('express');

module.exports = function (req:express.Request, res:express.Response) {
  res.redirect('/list');
};
