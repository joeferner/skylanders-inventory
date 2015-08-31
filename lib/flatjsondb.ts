/// <reference path="../definitions/node/node.d.ts" />
/// <reference path="../definitions/glob/glob.d.ts" />
/// <reference path="../definitions/async/async.d.ts" />

import fs= require('fs');
import glob = require('glob');
import path = require('path');
import async = require('async');

module FlatJsonDb {
  interface MapResultCallback<T> {
    (err:Error, result:T):void;
  }
  interface MapFunction<T, R> {
    (item:T, callback:MapResultCallback<R>): void;
  }
  interface MapDoneFunction<T> {
    (err:Error, results:T[]): void;
  }

  export class Db {
    directory:string;

    constructor(directory:string) {
      this.directory = directory;
    }

    table(table:string) {
      return new Table(this, table);
    }

    getDirectory():string {
      return this.directory;
    }
  }

  class Query {
    table:Table;

    constructor(table:Table, load:(fileName:string, callback:(err:Error, result)=>any)=>any) {
      this.table = table;
    }

    map<T,R>(mapFunction:MapFunction<T,R>, doneFunction:MapDoneFunction<R>):void {
      this.table.getFileNames(function (err, fileNames) {
        if (err) {
          return doneFunction(err, null);
        }
        async.map(fileNames, function (fileName, callback) {
          fs.readFile(fileName, 'utf8', function (err, fileData) {
            if (err) {
              return callback(err, null);
            }
            var obj = JSON.parse(fileData);
            mapFunction(obj, function (err, result) {
              if (err) {
                return callback(err, null);
              }
              return callback(null, result);
            });
          });
        }, doneFunction);
      });
    }
  }

  class Table {
    db:Db;
    tableName:string;

    constructor(db:Db, tableName:string) {
      this.db = db;
      this.tableName = tableName;
    }

    findAll():Query {
      return new Query(this, function (fileName, callback) {
        return callback(null, true);
      });
    }

    getDirectory():string {
      return path.join(this.db.getDirectory(), this.tableName);
    }

    getFileNames(callback:(err:Error, fileNames:string[])=>any):void {
      var opts:glob.IOptions = {
        cwd: this.getDirectory()
      };
      return glob("*.json", opts, function (err, fileNames) {
        if (err) {
          return callback(err, null);
        }
        for (var i = 0; i < fileNames.length; i++) {
          fileNames[i] = path.join(opts.cwd, fileNames[i]);
        }
        return callback(null, fileNames);
      });
    }
  }
}

module.exports = FlatJsonDb.Db;
