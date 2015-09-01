#!/bin/bash

PATH=${PATH}:/app/.heroku/node/bin/
cd /app/
npm install tsc -g && tsc -p . && npm start
