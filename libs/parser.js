'use strict';

let dotenv = require('dotenv').config()
let verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

let exec = require('child_process').exec;

module.exports = {
  open: function(data, callback) {
    exec('/usr/bin/php libs/receipt-parser.php ' + '"' + data + '"', function(err, stdout, stderr) {
      var obj = JSON.parse(stdout);
      if(obj != null) {
        //if(verbose) console.log(obj);
        callback(obj);
      }
    });
  }
};
