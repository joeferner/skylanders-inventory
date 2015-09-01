/// <reference path="../../typings/jquery/jquery.d.ts" />

declare module JQueryTablesorter {
  export interface JQueryStatic {
    addParser(opt:any):void;
  }
}

interface JQuery {
  tablesorter(opt:any):void;
}

interface JQueryStatic {
  tablesorter: JQueryTablesorter.JQueryStatic;
}
