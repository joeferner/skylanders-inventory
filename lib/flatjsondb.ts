/// <reference path="../definitions/node/node.d.ts" />
/// <reference path="../definitions/glob/glob.d.ts" />
/// <reference path="../definitions/async/async.d.ts" />

import fs= require('fs');
import glob = require('glob');
import path = require('path');
import async = require('async');

module flatjsondb {
  interface MapResultCallback<T> {
    (err:Error, result:T):void;
  }
  interface MapFunction<T, R> {
    (item:T, callback:MapResultCallback<R>): void;
  }
  interface MapDoneFunction<T> {
    (err:Error, results:T[]): void;
  }

  interface EachCallback {
    (err?:Error): void;
  }
  interface EachFunction<T> {
    (item:T, callback:EachCallback): void;
  }
  interface EachDoneFunction {
    (err:Error): void;
  }

  interface LoadFunction {
    (fileName:string, callback:(err:Error, result:Object)=>any):void;
  }

  export interface Data {
    _id:string;
    _dataKeys:string[];
  }

  export class Db {
    directory:string;

    constructor(directory:string) {
      this.directory = directory;
    }

    table(table:string):Table {
      return new Table(this, table);
    }

    getDirectory():string {
      return this.directory;
    }
  }

  class Query {
    table:Table;
    load:LoadFunction;

    constructor(table:Table, load:LoadFunction) {
      this.table = table;
      this.load = load;
    }

    map<T,R>(mapFunction:MapFunction<T,R>, doneFunction:MapDoneFunction<R>):void {
      this.table.getFileNames((err, fileNames) => {
        if (err) {
          return doneFunction(err, null);
        }
        async.map(fileNames, (fileName, callback) => {
          this.load(fileName, function (err, obj) {
            if (err) {
              return callback(err, null);
            }
            mapFunction(<T>obj, function (err, result) {
              if (err) {
                return callback(err, null);
              }
              return callback(null, result);
            });
          });
        }, doneFunction);
      });
    }

    each<T>(eachFunction:EachFunction<T>, doneFunction:EachDoneFunction):void {
      this.table.getFileNames((err, fileNames) => {
        if (err) {
          return doneFunction(err);
        }
        async.eachLimit(fileNames, 5, (fileName, callback) => {
          this.load(fileName, function (err, obj) {
            if (err) {
              return callback(err);
            }
            eachFunction(<T>obj, function (err) {
              if (err) {
                return callback(err);
              }
              return callback(null);
            });
          });
        }, doneFunction);
      });
    }
  }

  export class Table {
    db:Db;
    tableName:string;

    constructor(db:Db, tableName:string) {
      this.db = db;
      this.tableName = tableName;
    }

    findAll():Query {
      return new Query(this, this.load);
    }

    findById<T>(id:string, callback:(err?:Error, data?:T)=>any):void {
      var fileName = this.getFileName(id);
      this.load(fileName, callback);
    }

    load<T>(fileName:string, callback:(err?:Error, data?:T)=>any):void {
      fs.readFile(fileName, 'utf8', function (err, fileData) {
        if (err) {
          return callback(err);
        }
        var obj;
        try {
          obj = JSON.parse(fileData);
        } catch (e) {
          return callback(new Error('Could not load ' + fileName + ': ' + e));
        }
        obj._id = path.basename(fileName, '.json');
        var dataGlobPath = path.dirname(fileName) + '/' + obj._id + '*.data';
        glob(dataGlobPath, function (err, dataFileNames) {
          if (err) {
            return callback(err);
          }
          for (var i = 0; i < dataFileNames.length; i++) {
            dataFileNames[i] = path.basename(dataFileNames[i], '.data');
            dataFileNames[i] = dataFileNames[i].substr(obj._id.length + '.'.length);
          }
          obj._dataKeys = dataFileNames;
          return callback(null, obj);
        });
      });
    }

    save(id:string, data:Object, callback:(err:Error)=>any):void {
      delete (<Data>data)._id;
      delete (<Data>data)._dataKeys;

      var fileName = this.getFileName(id);
      var dataString = JSON.stringify(data, null, 2);
      fs.writeFile(fileName, dataString, callback);
    }

    saveData(id:string, key:string, body, callback:(err:Error)=>any):void {
      var fileName = this.getFileName(id, key);
      fs.writeFile(fileName, body, callback);
    }

    loadData(id:string, key:string, callback:(err:Error, data:Buffer)=>any):void {
      var fileName = this.getFileName(id, key);
      fs.readFile(fileName, callback);
    }

    update<T>(id:string, data:Object, callback:(err:Error, obj?:T)=>any):void {
      this.findById(id, (err, existingData) => {
        if (err) {
          return callback(err);
        }
        existingData = existingData || {};
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            existingData[key] = data[key];
          }
        }
        this.save(id, existingData, function (err) {
          if (err) {
            return callback(err);
          }
          return callback(null, <T>existingData);
        });
      });
    }

    getDirectory():string {
      return path.join(this.db.getDirectory(), this.tableName);
    }

    getFileName(id:string, key?:string) {
      if (key) {
        return path.join(this.getDirectory(), id + '.' + key + '.data');
      }
      return path.join(this.getDirectory(), id + '.json');
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

export = flatjsondb;