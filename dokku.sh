#!/bin/bash

PATH=${PATH}:/app/.heroku/node/bin/
cd /app/
npm install tsc tsd -g && tsd install && tsc -p . && npm start
