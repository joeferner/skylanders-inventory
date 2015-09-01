/// <reference path="../../skylanders.d.ts" />

import express = require('express');
import skylanders = require('skylanders');

module.exports = function (req:skylanders.Request, res:skylanders.Response, next:Function) {
  req.app.db.table('characters').findAll().map(function (item, callback) {
    return callback(null, item);
  }, function (err, characters) {
    if (err) {
      return next(err);
    }
    var template = req.app.templates['character/list.hbs'];
    var body = template({
      characters: characters
    });
    req.app.sendInTemplate(res, {
      title: 'Characters',
      body: body
    });
  });
};
