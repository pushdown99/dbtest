'use strict';

let dotenv = require('dotenv').config()
let verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

let fs     = require('fs');
let pdf    = require('pdfkit');
let rand   = require('random-key');

let pdfdir = null; 

module.exports = {
  init: function() {
    pdfdir  = process.env.DIR_PDF || '.';
    if (!fs.existsSync(pdfdir)) fs.mkdirSync(pdfdir); 
    return pdfdir;
  },
  read: function(f) {
    return fs.readFileSync(f);
  },
  write: function(data, name=null, callback=null) {
    if(pdfdir == null) this.init();
    if(name == null) name = rand.generate(16);

    let f = pdfdir + '/' + name + '.pdf';
    let doc    = new pdf({
      size: [224, 600],
      margins : { // by default, all are 72
        top: 10,
        bottom:10,
        left: 10,
        right: 10
      }
    });
    var out = fs.createWriteStream(f);
    doc.pipe(out);
    doc
      .font('fonts/NanumGothicCoding.ttf')
      .fontSize(9)
      .text(data, 15, 15);
    doc.end();

    fs.unlink(pdfdir + '/latest.pdf', (err) => {});
    fs.symlink('./' + name + '.pdf',  pdfdir + '/latest.pdf', (err) => {});
    if(callback) callback(name, f);
  }
};
