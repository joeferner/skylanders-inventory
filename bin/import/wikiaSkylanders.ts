/// <reference path="../../lib/skylanders.d.ts" />

import request = require('request');
import path = require('path');
import async = require('async');
import flatjsondb = require('../../lib/flatjsondb');
var cheerio = require('cheerio');

var dataDirectory = require('../../dataDirectory');
var charactersTable = new flatjsondb.Db(dataDirectory).table('characters');
var baseUrl = 'http://skylanders.wikia.com';

request(baseUrl + '/wiki/Skylanders', function (err, response, body) {
  var html:CheerioStatic = cheerio.load(body);
  var links:CheerioElement[] = <CheerioElement[]><any>html('#mw-content-text ul li a');
  async.eachLimit(links, 2, function (link, callback) {
    var href:string = link.attribs['href'];
    if (href.indexOf('/wiki/') == 0 && href.indexOf('/wiki/Skylanders') < 0) {
      console.log('saving', href);
      var id = href.substr('/wiki/'.length);
      charactersTable.update(id, {}, function (err) {
        if (err) {
          return callback(err);
        }
        request(baseUrl + href, function (err, response, body) {
          if (err) {
            return callback(err);
          }
          console.log('saving', href, 'data');
          charactersTable.saveData(id, 'skylanders.wikia.com', body, callback);
        });
      });
    } else {
      callback();
    }
  }, function (err) {
    if (err) {
      console.log(err);
    }
  });
});