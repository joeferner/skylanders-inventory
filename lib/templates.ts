/// <reference path="../lib/skylanders.d.ts" />

import handlebars = require('handlebars');
import glob = require('glob');
import async = require('async');
import path = require('path');
import fs = require('fs');

var templateDirectory = path.join(__dirname, '../templates');

exports.load = function (callback:(err:Error, templates?:HandlebarsTemplates)=>any) {
  glob('**/*.hbs', {cwd: templateDirectory}, function (err, fileNames) {
    if (err) {
      return callback(err);
    }
    var results:HandlebarsTemplates = {};
    async.each(fileNames, function (fileName, callback) {
      console.log("Loading template", fileName);
      fs.readFile(path.join(templateDirectory, fileName), 'utf8', function (err, data) {
        if (err) {
          return callback(err);
        }
        results[fileName] = handlebars.compile(data);
        return callback(null);
      });
    }, function (err) {
      if (err) {
        return callback(err);
      }
      return callback(null, results);
    });
  });
};
