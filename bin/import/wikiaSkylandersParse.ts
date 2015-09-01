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
import fs = require('fs');
var cheerio = require('cheerio');

var dataDirectory = require('../../dataDirectory');
var charactersTable = new flatjsondb.Db(dataDirectory).table('characters');

charactersTable.findAll().each<skylanders.CharacterData>(function (item:skylanders.CharacterData, callback) {
  charactersTable.loadData(item._id, 'skylanders.wikia.com', function (err, wikiaData) {
    if (err) {
      return callback(err);
    }
    var html:CheerioStatic = cheerio.load(wikiaData.toString('utf8'));
    item.name = html('.header-title h1').text();
    item.name = item.name.replace(/ \(character\)/g, '');

    var imageUrl;
    var images:CheerioElement[] = <CheerioElement[]><any>html('table.infobox a img');
    if (images && images.length > 0) {
      for (var i = 0; i < images.length; i++) {
        var dataSrc = images[i].attribs['data-src'] || images[i].attribs['src'];
        var width = images[i].attribs['width'];
        if (dataSrc && width && parseInt(width) > 200) {
          imageUrl = dataSrc;
        }
      }
      if (!imageUrl) {
        console.error('Could not find image for ' + item._id);
      }
    }

    var firstRelease = null;
    var infoBoxAttributes:CheerioElement[] = <CheerioElement[]><any>html('table.infobox tr');
    for (var i = 0; i < infoBoxAttributes.length; i++) {
      var infoBoxAttribute = infoBoxAttributes[i];
      var infoBoxHtml = html.html(infoBoxAttribute);
      var row = cheerio.load(infoBoxHtml);
      var rowTitle = row.root().find('th').text();
      var rowValue = row.root().find('td').text();
      if (rowTitle.toLowerCase().indexOf('element') >= 0) {
        item.element = rowValue.toLowerCase().trim();
      } else if (rowTitle.toLowerCase().indexOf('role') >= 0) {
        item.trapMaster = rowValue.toLowerCase().indexOf('trap master') >= 0;
        item.mini = rowValue.toLowerCase().indexOf('mini') >= 0;
      } else if (rowTitle.toLowerCase().indexOf('first release') >= 0) {
        firstRelease = rowValue.toLowerCase().trim();
        if (firstRelease.indexOf('skylanders:') == 0) {
          firstRelease = firstRelease.substr('skylanders:'.length).trim();
        }
        if (firstRelease.indexOf('skylander:') == 0) {
          firstRelease = firstRelease.substr('skylander:'.length).trim();
        }

        if (firstRelease == "spyro's adventure") {
          item.compatibility = {
            spyrosAdventure: true,
            giants: true,
            swapForce: true,
            trapTeam: true,
            superchargers: true
          };
        } else if (firstRelease == "giants") {
          item.compatibility = {
            giants: true,
            swapForce: true,
            trapTeam: true,
            superchargers: true
          };
        } else if (firstRelease == "swap force") {
          item.compatibility = {
            swapForce: true,
            trapTeam: true,
            superchargers: true
          };
        } else if (firstRelease == "trap team") {
          item.compatibility = {
            trapTeam: true,
            superchargers: true
          };
        } else if (firstRelease == "superchargers") {
          item.compatibility = {
            superchargers: true
          };
        } else {
          console.log('could not parse first release for item: ' + item._id + ' "' + firstRelease + '"');
        }
      }
      //else{console.log(rowTitle, '====', rowValue);}
    }

    async.auto({
      'image': function (callback) {
        if (!imageUrl || item._dataKeys.indexOf('thumbnail') >= 0) {
          return callback();
        }
        console.log('downloading image for ', item._id, ':', imageUrl);
        var out = fs.createWriteStream(charactersTable.getFileName(item._id, 'thumbnail'));
        request(imageUrl)
          .on('error', callback)
          .on('end', callback)
          .pipe(out);
      }
    }, function (err) {
      if (err) {
        return callback(err);
      }
      charactersTable.update(item._id, item, callback);
    });
  });
}, function (err) {
  if (err) {
    console.error(err);
  }
  console.log('done');
});