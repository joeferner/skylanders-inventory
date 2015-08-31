/// <reference path="../definitions/express/express.d.ts" />
/// <reference path="../definitions/handlebars/handlebars.d.ts" />
/// <reference path="./flatjsondb.ts" />

declare module "skylanders" {
  import express = require('express');

  interface Express extends express.Express {
    db:FlatJsonDb.Db;
    templates:HandlebarsTemplateDelegate[];

    sendInTemplate(req:Response, data:any):void;
  }

  interface Request extends express.Request {
    app:Express;
  }

  interface Response extends express.Response {
  }
}
