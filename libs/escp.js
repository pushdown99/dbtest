'use strict';

let dotenv = require('dotenv').config()
let verbose = process.env.VERBOSE || false
verbose = (verbose == 'true');

let iconv      = require('iconv-lite');

const ESC       =  27;  // escape code
const RESET     =  64;
const BOLD      =  69;
const UNDERLINE =  45;
const ALIGN     =  97;
const POINT     =  77;
const FONTATTR  =  38;
const COLOR     = 114;
const PAPERCUT  =  29;

module.exports = {
  parse: function (data) {
    data = Buffer.from(data, 'hex');
    const buf = [];
    var idx = 0;

    for(var i=0; i<data.length; i++) {
      switch(data[i]) {
      case ESC:
        switch (data[++i]) {
        case 64: 
          break;
        case 33:
        case 45:
        case 69:
        case 77:
        case 97:
        case 100:
        case 105:
        case 114: 
          i += 1; break;
        case 29: 
          idx = i - 1; i += 2; break;
        default: 
          i += 1; break;
        }
        break;
      default:
        if(data[i] >= 32) {
          buf.push(data[i]);
        }
        else if(data[i] == 10) {
          buf.push(data[i]);
        }
        else if(data[i] == 13) {
          buf.push(data[i]);
        }
        else if(data[i] == 29) {
          idx = i;
        }
        else {
          buf.push(data[i]);
        }
      }
    }
    if(idx == 0) idx = data.length - 1;
    return  iconv.decode(Buffer.from(buf), 'euc-kr').toUpperCase();
  },
  open: function (data) {
    return this.escp(data);
  }
};
