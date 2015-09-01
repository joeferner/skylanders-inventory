/// <reference path="../../skylanders.d.ts" />

import express = require('express');
import skylanders = require('skylanders');

module.exports = function (req:skylanders.Request, res:skylanders.Response, next:Function) {
  var characterId = req.params.id;
  var own = req.body.value == 'true';
  var charactersTable = req.app.db.table('characters');
  charactersTable.findById<skylanders.CharacterData>(characterId, function (err, characterData) {
    if (err) {
      return next(err);
    }
    console.log('setting ' + characterId + ' as owned = ' + own);
    charactersTable.update(characterId, {own: own}, function (err, updatedCharacter) {
      if (err) {
        return next(err);
      }
      res.send(updatedCharacter);
    });
  });
};
