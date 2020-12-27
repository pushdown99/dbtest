'use strict';

let fs     = require('fs');
let rand   = require("random-key");
let QRCode = require("qrcode");

module.exports = {
  exists: function(f, callback = null) {
    fs.exists(f, function(r) {
      callback (r);
    });
  },
  toint: function(s) {
    if(s == undefined) return 0;
    return parseInt(s.replace(/\,/g, ''), 10);
  },
  response: function(result, req, res) {
    res.contentType('application/json');
    //console.log(JSON.stringify(result));
    res.send(JSON.stringify(result));
  },
  generateDigits: function(length = 10, callback=null) {
    return rand.generateDigits(length);
  },
  generateBase30: function(callback=null) {
    return rand.generateBase30(length);
  },
  generate: function(length = 10, callback=null) {
    return rand.generate(length);
  },
  generateQRcode: function(length = 17, callback=null) {
    return "QR-" + rand.generate(length);
  },
  generateCoupon: function(length = 17, callback=null) {
    return "CP-" + rand.generate(length);
  },
  generateStamp: function(length = 17, callback=null) {
    return "ST-" + rand.generate(length);
  },
  generateFlyer: function(length = 17, callback=null) {
    return "FL-" + rand.generate(length);
  },
  generateLicense: function(length = 17, callback=null) {
    return "LC-" + rand.generateDigits(length);
  },
  qrcode: function(text, callback = null) {
    QRCode.toDataURL(text, function (e, d) {
      return callback(e, d);
    })
   },
}

