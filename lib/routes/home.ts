/// <reference path="../../lib/skylanders.d.ts" />
import express = require('express');

module.exports = function (req:express.Request, res:express.Response) {
  res.redirect('/character/');
};
