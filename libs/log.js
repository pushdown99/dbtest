'use strict';

let dotenv = require('dotenv').config()
let verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

let path    = require('path');
let winston = require('winston');
let { format: { combine, colorize, timestamp, json }, } = winston;

let logger = null;

module.exports = {
  open: function (f, d) {
    console.log("open: " + f + ',' + d);
    logger = winston.createLogger({
      level: "info",
      format: combine(timestamp(), json()),
      transports: [
        //new winston.transports.File({ filename: f, dirname: path.join(__dirname, d) }),
        new winston.transports.File({ filename: f, dirname: d }),
      ],
    });
    return logger;
  },
  info: function (d) {
    console.log("info: " + d);
    logger.info (d);
  }
}
