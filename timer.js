'use strict';

const dotenv = require('dotenv').config()
let verbose  = process.env.VERBOSE || false
verbose = (verbose == 'true');

var db = require('./libs/db.js');

module.exports = {
  interval: function(t, callback) {
    setInterval(callback, t*1000);
  },
  timeout: function(t, callback, arg=null) {
    setTimeout(callback, t*1000, arg);
  },
}
