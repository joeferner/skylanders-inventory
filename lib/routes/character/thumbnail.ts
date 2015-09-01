/// <reference path="../../skylanders.d.ts" />

import express = require('express');
import skylanders = require('skylanders');

module.exports = function (req:skylanders.Request, res:skylanders.Response, next:Function) {
  var characterId = req.params.id;
  var charactersTable = req.app.db.table('characters');
  charactersTable.findById<skylanders.CharacterData>(characterId, function (err, characterData) {
    if (err) {
      return next(err);
    }
    if (characterData._dataKeys.indexOf('thumbnail') < 0) {
      return next();
    }
    charactersTable.loadData(characterData._id, 'thumbnail', function (err, data) {
      if (err) {
        return next(err);
      }
      res.writeHead(200, {'Content-Type': 'image/png'});
      res.end(data, 'binary');
    });
  });
};
