'use strict';

module.exports = {
  toint: function(s) {
    if(s == undefined) return 0;
    return parseInt(s.replace(/\,/g, ''), 10);
  },
  response: function(result, req, res) {
    res.contentType('application/json');
    //console.log(JSON.stringify(result));
    res.send(JSON.stringify(result));
  },
  generate: function(id, callback=null) {
    return rand.generateDigits(10);
  },
}

