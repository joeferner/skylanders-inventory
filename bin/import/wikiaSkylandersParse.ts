/// <reference path="../../definitions/request/request.d.ts" />
/// <reference path="../../definitions/cheerio/cheerio.d.ts" />
/// <reference path="../../definitions/async/async.d.ts" />
/// <reference path="../../lib/flatjsondb.ts" />
/// <reference path="../../lib/skylanders.d.ts" />

import request = require('request');
import path = require('path');
import async = require('async');
import flatjsondb = require('../../lib/flatjsondb');
import skylanders = require('skylanders');
var cheerio = require('cheerio');

var dataDirectory = path.join(__dirname, '../../data');
var charactersTable = new flatjsondb.Db(dataDirectory).table('characters');

charactersTable.findAll().each<skylanders.CharacterData>(function (item, callback) {
  console.log('parsing', item._id);
  charactersTable.loadData(item._id, 'skylanders.wikia.com', function (err, wikiaData) {
    if (err) {
      return callback(err);
    }
    var html:CheerioStatic = cheerio.load(wikiaData.toString('utf8'));
    item.name = html('.header-title h1').text();
    item.name = item.name.replace(/ \(character\)/g, '');
    charactersTable.update(item._id, item, callback);
  });
}, function (err) {
  if (err) {
    console.error(err);
  }
  console.log('done');
});