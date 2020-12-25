'use strict';

let dotenv = require('dotenv').config()
let verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

let fs     = require('fs');
let rand   = require('random-key');

let txtdir = null;

module.exports = {
  init: function() {
    txtdir  = process.env.DIR_TXT || '.';
    if (!fs.existsSync(txtdir)) fs.mkdirSync(txtdir);
    return txtdir;
  },
  read: function(f) {
    return fs.readFileSync(f);
  },
  write: function(data, name=null, callback=null) {
    if(txtdir == null) this.init();
    if(name == null) name = rand.generate(16);

    let f = txtdir + '/' + name + '.txt';

    fs.writeFile(f, data, function (e) {
      if (e && verbose) console.log(e);
      if (callback) callback(name, f);
    });
  }
};

