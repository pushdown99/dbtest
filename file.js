'use strict';

const dotenv  = require('dotenv').config()
let   verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

let fs = require('fs');

module.exports = {
  downloadPdf: function (f, req, res) {
    var p = process.env.DIR_PDF + "/" + f;

    fs.exists(p, (exists) => {
      if(exists) {
        //console.log(exists ? 'Found' : 'Not Found!');
        var data =fs.readFileSync(p);
        res.contentType("application/pdf");
        res.send(data);
      }
      else {
        var result = { code: 404, message: "Not found!" }
        res.contentType("application/json");
        res.send (result);
      }
    });
  },
  downloadPng: function(d, req, res) {
    res.contentType("image/png");
    res.send(d);
  }
}

