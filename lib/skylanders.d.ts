/// <reference path="../definitions/express/express.d.ts" />
/// <reference path="../definitions/handlebars/handlebars.d.ts" />
/// <reference path="./flatjsondb.ts" />

declare module "skylanders" {
  import express = require('express');
  import FlatJsonDb = require('flatjsondb');

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

  interface CharacterCompatibility {
    spyrosAdventure?:boolean;
    giants?:boolean;
    swapForce?:boolean;
    trapTeam?:boolean;
    superchargers?:boolean;
  }

  interface CharacterData extends FlatJsonDb.Data {
    name:string;
    compatibility: CharacterCompatibility;
    own:boolean;
  }
}
